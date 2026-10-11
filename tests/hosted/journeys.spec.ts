import { test, expect, type Browser, type Page } from "@playwright/test"
import jsQR from "jsqr"
import * as OTPAuth from "otpauth"
import { PNG } from "pngjs"
import { accountsOrigin, appOrigin } from "./hosted-env.ts"
import {
  fillSignUp,
  handoff,
  mailMark,
  nameIssuerRateLimit,
  newPage,
  openVerification,
  passwordOnIssuer,
  person,
  press,
  readMail,
  removeCreatedAccounts,
  sixDigitCode,
  waitForHydrated,
  type Person,
} from "./accounts.ts"

// Every way into Devlinks, clicked from its own pages against the deployed
// previews: sign-up, sign-out, and each sign-in option the Breakthrough
// account offers. One synthetic account per run; it is removed afterwards.
test.describe.configure({ mode: "serial" })
test.afterEach(({}, testInfo) => nameIssuerRateLimit(testInfo))
test.afterAll(removeCreatedAccounts)

let member: Person
// The first browser: it signs up, later holds the passkey and approves other devices.
let home: Page

const signInButton = (page: Page) =>
  page.getByRole("button", { name: "Sign in with Breakthrough" })
const signedOutHeading = (page: Page) =>
  page.getByRole("heading", { name: "Save your profile to your account" })

async function signedIn(page: Page) {
  await expect(page).toHaveURL(appOrigin + "/account", handoff)
  await expect(
    page.getByText(`Signed in as ${member.name} (${member.email}).`)
  ).toBeVisible()
}
/** From Devlinks' Account page to the issuer's sign-in page. */
async function continueToIssuer(page: Page) {
  await press(signInButton(page))
  await expect(page).toHaveURL(
    url => url.origin === accountsOrigin && url.pathname === "/login",
    handoff
  )
}
/** A fresh browser that has never signed in, opened at the issuer from Account. */
async function freshAtSignIn(browser: Browser) {
  const page = await newPage(browser)
  await page.goto(appOrigin + "/account")
  await continueToIssuer(page)
  return page
}
/** Decodes the rendered approval QR from pixels, as a phone camera would. */
async function scanApprovalQr(page: Page, visibleCode: string) {
  const image = page.getByRole("img", {
    name: "Open device approval with the public request code",
  })
  await expect(image).toBeVisible()
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0
      )
    )
    .toBe(true)
  const png = PNG.sync.read(await image.screenshot())
  const pixels = new Uint8ClampedArray(
    png.data.buffer,
    png.data.byteOffset,
    png.data.byteLength
  )
  const decoded = jsQR(pixels, png.width, png.height)
  if (!decoded) throw new Error("The rendered approval QR code could not be scanned")
  const link = new URL(decoded.data)
  expect(link.origin).toBe(accountsOrigin)
  expect(link.pathname).toBe("/approve")
  expect(link.searchParams.get("code")).toBe(visibleCode)
  return link.href
}

test("sign up: a new visitor creates a Breakthrough account from Devlinks", async ({
  browser,
}) => {
  member = person("j")
  home = await newPage(browser)
  await home.goto(appOrigin + "/")
  await press(home.getByRole("link", { name: "Account", exact: true }))
  await expect(home).toHaveURL(appOrigin + "/account")
  await expect(signedOutHeading(home)).toBeVisible()
  await home.screenshot({
    path: "test-results-hosted/journey-account-1440.png",
    fullPage: true,
  })

  await test.step("the sign-in button shows it is busy and stays focusable", async () => {
    // Watch the real request rather than delay it: the button reports each
    // busy moment before the browser leaves for the account page.
    const busy: Array<{ text: string; disabled: boolean }> = []
    await home.exposeFunction(
      "reportSignInBusy",
      (state: { text: string; disabled: boolean }) => busy.push(state)
    )
    await (await waitForHydrated(signInButton(home))).evaluate((button: HTMLButtonElement) => {
      const report = (
        window as unknown as {
          reportSignInBusy: (state: { text: string; disabled: boolean }) => void
        }
      ).reportSignInBusy
      new MutationObserver(() => {
        if (button.getAttribute("aria-busy") === "true")
          report({ text: button.textContent ?? "", disabled: button.disabled })
      }).observe(button, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      })
    })
    await continueToIssuer(home)
    expect(busy.length, "The button showed a busy state").toBeGreaterThan(0)
    expect(busy[0]).toEqual({ text: "Opening sign-in…", disabled: false })
  })

  await press(home.getByRole("link", { name: "Create an account" }))
  await expect(home).toHaveURL(
    url => url.origin === accountsOrigin && url.pathname === "/create-account"
  )
  await fillSignUp(home, member)
  await openVerification(home, member)
  await home.getByRole("link", { name: "Continue to sign in" }).click()
  await expect(home).toHaveURL(
    url => url.origin === accountsOrigin && url.pathname === "/login"
  )
  await passwordOnIssuer(home, member)
  await signedIn(home)
  await home.screenshot({
    path: "test-results-hosted/journey-signed-in-1440.png",
    fullPage: true,
  })

  await test.step("signed in, sign-in routes never paint and Account never shows signed out", async () => {
    // Pitfall SI1. /login redirects on the server, so no /login document commits.
    const painted: string[] = []
    const record = (frame: import("@playwright/test").Frame) => {
      if (frame === home.mainFrame()) painted.push(new URL(frame.url()).pathname)
    }
    home.on("framenavigated", record)
    const response = await home.goto(appOrigin + "/login")
    home.off("framenavigated", record)
    const hop = response?.request().redirectedFrom()
    expect(
      hop && new URL(hop.url()).pathname,
      "the first response for /login is an HTTP redirect"
    ).toBe("/login")
    expect(painted, "no document for /login was committed").not.toContain("/login")
    // Account waits for the account check, so the signed-out offer never flashes.
    await home.evaluate(() => {
      const flag = window as unknown as { sawSignedOut?: boolean }
      flag.sawSignedOut = false
    })
    await home.addInitScript(() => {
      const flag = window as unknown as { sawSignedOut?: boolean }
      flag.sawSignedOut = false
      new MutationObserver(() => {
        if (document.body?.innerText.includes("Save your profile to your account"))
          flag.sawSignedOut = true
      }).observe(document, { childList: true, subtree: true, characterData: true })
    })
    await home.goto(appOrigin + "/account")
    await signedIn(home)
    expect(
      await home.evaluate(
        () => (window as unknown as { sawSignedOut?: boolean }).sawSignedOut
      ),
      "Account showed the signed-out offer while signed in"
    ).toBe(false)
  })
})

test("log out: signing out of Devlinks keeps the account; signing out of the account ends Devlinks too", async () => {
  await press(
    home.getByRole("button", { name: "Sign out of Devlinks", exact: true })
  )
  await expect(signedOutHeading(home)).toBeVisible()
  // The Breakthrough account is still signed in, so returning takes one press.
  await press(signInButton(home))
  await signedIn(home)

  await home.goto(accountsOrigin + "/account")
  await press(home.getByRole("button", { name: "Sign out", exact: true }))
  await expect(home).toHaveURL(
    url => url.origin === accountsOrigin && url.pathname === "/login"
  )
  // Devlinks re-checks the account on its next read. This browser was signed
  // in, so it says the sign-in expired and offers to sign in again or go on
  // as a guest, instead of showing the account.
  await home.goto(appOrigin + "/account")
  const expired = home.getByRole("region", { name: "Sign-in expired" })
  await expect(expired).toBeVisible()
  await expect(
    expired.getByRole("button", { name: "Sign in again" })
  ).toBeVisible()
  await expect(home.getByText(/^Signed in as /)).toHaveCount(0)
})

test("log in with a password from a new browser", async ({ browser }) => {
  const page = await freshAtSignIn(browser)
  // This browser is new to the account, so the issuer also emails a code.
  expect(await passwordOnIssuer(page, member)).toBe("/verify-device")
  await signedIn(page)
  await page.context().close()
})

test("log in with an emailed sign-in code", async ({ browser }) => {
  const page = await freshAtSignIn(browser)
  await press(page.getByRole("tab", { name: "Email code", exact: true }))
  await (
    await waitForHydrated(page.getByLabel("Account email", { exact: true }))
  ).fill(member.email)
  const seen = await mailMark(member.email)
  await page
    .getByRole("button", { name: "Send sign-in code", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Check your email.", exact: true })
  ).toBeVisible()
  const code = sixDigitCode(
    await readMail(member.email, "Your Breakthrough account sign-in code", seen)
  )
  await page.getByLabel("Email sign-in code", { exact: true }).fill(code)
  await page
    .getByRole("button", { name: "Verify and sign in", exact: true })
    .click()
  await signedIn(page)
  await page.context().close()
})

test("log in with a passkey", async () => {
  // Enroll a passkey on the account, from the browser that signed up.
  await home.goto(accountsOrigin + "/login")
  await passwordOnIssuer(home, member)
  await expect(home).toHaveURL(accountsOrigin + "/account")
  const cdp = await home.context().newCDPSession(home)
  await cdp.send("WebAuthn.enable")
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })
  await press(home.getByRole("button", { name: "Add a passkey" }))
  await expect(home.getByText("Your passkey is ready to use.")).toBeVisible()
  await press(home.getByRole("button", { name: "Sign out", exact: true }))
  await expect(home).toHaveURL(
    url => url.origin === accountsOrigin && url.pathname === "/login"
  )

  // This browser was signed in before, so Devlinks offers "Sign in again".
  await home.goto(appOrigin + "/account")
  await press(home.getByRole("button", { name: "Sign in again" }))
  await expect(home).toHaveURL(
    url => url.origin === accountsOrigin && url.pathname === "/login",
    handoff
  )
  await press(home.getByRole("tab", { name: "Passkey", exact: true }))
  await press(home.getByRole("button", { name: "Continue with a passkey" }))
  await signedIn(home)
})

test("log in by approving the request on a signed-in phone", async ({
  browser,
}) => {
  // `home` is signed in to the account (passkey); it plays the phone.
  const page = await freshAtSignIn(browser)
  await press(page.getByRole("tab", { name: "Phone approval", exact: true }))
  await press(page.getByRole("button", { name: "Create approval code" }))
  const code = (await page.getByTestId("device-code").innerText()).trim()
  await home.goto(await scanApprovalQr(page, code))
  await press(home.getByRole("button", { name: "Review request" }))
  await expect(
    home.getByRole("heading", { name: "Is this your request?" })
  ).toBeVisible()
  await (
    await waitForHydrated(home.getByLabel("Number shown on the other device"))
  ).fill((await page.getByTestId("match-number").innerText()).trim())
  await home.getByRole("button", { name: "Approve sign-in" }).click()
  await expect(
    home.getByRole("heading", { name: "You can return to the other device." })
  ).toBeVisible()
  await signedIn(page)
  await page.context().close()
})

test("log in with a password and an authenticator code", async ({
  browser,
}) => {
  await home.goto(accountsOrigin + "/account")
  await (
    await waitForHydrated(home.getByLabel("Confirm current password"))
  ).fill(member.password)
  await home.getByRole("button", { name: "Set up authenticator" }).click()
  await home.getByText("Cannot scan? Show setup key").click()
  const secret = await home.getByTestId("totp-secret").innerText()
  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
  const enrollment = totp.generate()
  await home.getByLabel("Authenticator setup code").fill(enrollment)
  await home
    .getByRole("button", { name: "Verify authenticator", exact: true })
    .click()
  await expect(
    home.getByText("Authenticator setup complete.", { exact: false })
  ).toBeVisible()
  await home.getByRole("button", { name: "I saved my backup codes" }).click()
  await expect(
    home.getByText("Authenticator enabled", { exact: true })
  ).toBeVisible()

  const page = await freshAtSignIn(browser)
  expect(await passwordOnIssuer(page, member)).toBe("/two-factor")
  // A code is accepted once; wait for the next one after enrollment.
  await expect
    .poll(() => totp.generate(), { timeout: 35_000, intervals: [250] })
    .not.toBe(enrollment)
  await (
    await waitForHydrated(page.getByLabel("Authenticator code", { exact: true }))
  ).fill(totp.generate())
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await signedIn(page)
  await page.context().close()
  await home.context().close()
})
