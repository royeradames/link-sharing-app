import {
  expect,
  type Browser,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test"
import { randomBytes } from "node:crypto"
import { z } from "zod"
import { removeHostedAccounts } from "../../scripts/hosted-accounts.mjs"
import {
  accountsOrigin,
  authorizePreviews,
  previewDatabaseURL,
  readSink,
  removeSyntheticAccount,
} from "./hosted-env.ts"

// Synthetic Breakthrough accounts. Reserved .test recipients go to the
// issuer's preview sink, never to a real inbox. Every address starts with
// "devlinks-suite-" so cleanup can find and remove them.
const run = Date.now().toString(36) + randomBytes(3).toString("hex")
const created = new Set<string>()
export function person(label: string) {
  const account = {
    name: "Devlinks Suite " + label,
    username: "devlinkssuite" + label + run,
    email: "devlinks-suite-" + label + "-" + run + "@sink.accounts-preview.test",
    password: "A synthetic Devlinks phrase " + randomBytes(6).toString("hex"),
  }
  created.add(account.email)
  return account
}
export type Person = ReturnType<typeof person>

/**
 * Removes this run's accounts from the issuer, then every devlinks-suite-
 * account's principal and profile from Devlinks' Preview schema. One failed
 * removal doesn't stop the rest; failures are reported together at the end.
 */
export async function removeCreatedAccounts() {
  const failed: string[] = []
  for (const email of created) {
    const status = await removeSyntheticAccount(email).then(
      response => response.status,
      () => 0
    )
    if (status === 200) created.delete(email)
    else failed.push(email.split("@")[0] + " (HTTP " + status + ")")
  }
  const devlinks = await removeHostedAccounts(previewDatabaseURL).catch(
    (error: unknown) => {
      failed.push(error instanceof Error ? error.message : "Devlinks cleanup failed")
      return null
    }
  )
  if (devlinks)
    console.log(
      `Devlinks cleanup: removed ${devlinks.accounts} accounts and ${devlinks.profiles} profiles, remaining ${devlinks.remaining}`
    )
  if (devlinks && devlinks.remaining !== 0)
    failed.push(`${devlinks.remaining} Devlinks accounts remain`)
  expect(failed, "Synthetic accounts that could not be removed").toEqual([])
}

// Issuer responses refused with HTTP 429 during the current test. The issuer
// allows about 100 requests per path per 15 minutes from one address, and a
// refused request shows the same "expired or unavailable" message as a real
// failure. A failed test says which it was.
const issuerRateLimits: string[] = []
/** For afterEach: a failure that coincides with issuer 429s is named as a rate limit, not a broken update. */
export function nameIssuerRateLimit(testInfo: TestInfo) {
  const paths = [...new Set(issuerRateLimits.splice(0))]
  if (!paths.length) return
  if (testInfo.status === testInfo.expectedStatus) {
    testInfo.annotations.push({
      type: "warning",
      description: "issuer rate-limited on " + paths.join(", "),
    })
    return
  }
  throw new Error(
    "issuer rate-limited on " +
      paths.join(", ") +
      " (HTTP 429): this failure is the shared issuer limit, not the update under test. Wait 15 minutes and run again."
  )
}

/**
 * Waits until React has hydrated this control (its props are attached), so a
 * click or fill reaches the component rather than server HTML. Same check as
 * royer-ui tests/helpers/hydration.ts.
 */
export async function waitForHydrated(locator: Locator) {
  await expect(locator).toBeVisible()
  await expect
    .poll(
      () =>
        locator.evaluate(element =>
          Object.keys(element).some(key => key.startsWith("__reactProps$"))
        ),
      { message: "the control hydrated before the test used it", timeout: 20_000 }
    )
    .toBe(true)
  return locator
}
/** Clicks a control once React has hydrated it. */
export async function press(locator: Locator) {
  await (await waitForHydrated(locator)).click()
}

/** Cross-site sign-in hops wake cold preview functions on both sides; give them longer. */
export const handoff = { timeout: 60_000 }

export async function newPage(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  await authorizePreviews(context)
  context.on("response", response => {
    const url = new URL(response.url())
    if (response.status() === 429 && url.origin === accountsOrigin)
      issuerRateLimits.push(url.pathname)
  })
  return context.newPage()
}

const mailSchema = z.object({
  messages: z.array(
    z.object({ subject: z.string(), text: z.string(), createdAt: z.string() })
  ),
})
type Mail = z.infer<typeof mailSchema>["messages"][number]
const mailKey = (message: Mail) =>
  message.createdAt + "\n" + message.subject + "\n" + message.text
async function mailbox(email: string) {
  const response = await readSink(email)
  if (response.status !== 200) return []
  return mailSchema.parse(await response.json()).messages
}
/** Marks the messages already present, so only mail caused by the next action counts. */
export async function mailMark(email: string) {
  return new Set((await mailbox(email)).map(mailKey))
}
export async function readMail(
  email: string,
  subject: string,
  seen = new Set<string>()
) {
  let found = ""
  await expect
    .poll(
      async () => {
        found =
          (await mailbox(email)).find(
            item => item.subject === subject && !seen.has(mailKey(item))
          )?.text ?? ""
        return Boolean(found)
      },
      {
        message: "Waiting for preview mail: " + subject,
        timeout: 30_000,
        intervals: [500, 1000, 2000],
      }
    )
    .toBe(true)
  return found
}
export function sixDigitCode(text: string) {
  const code = /\b(\d{6})\b/.exec(text)?.[1]
  if (!code) throw new Error("The message had no six-digit code")
  return code
}

/** Fills the issuer's sign-up form on the current page and submits it. */
export async function fillSignUp(page: Page, account: Person) {
  await (
    await waitForHydrated(page.getByLabel("Name", { exact: true }))
  ).fill(account.name)
  await page.getByLabel("Username", { exact: true }).fill(account.username)
  await page.getByLabel("Email", { exact: true }).fill(account.email)
  await page
    .locator("input")
    .and(page.getByLabel("Password", { exact: true }))
    .fill(account.password)
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill(account.password)
  const rules = page.getByRole("list", { name: "Password requirements" })
  await expect(
    rules.getByRole("listitem").filter({ hasText: /not met/ })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Create account", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Check your email" })
  ).toBeVisible()
}
/** Opens the emailed verification link; the issuer lands on a readable "verified" page. */
export async function openVerification(page: Page, account: Person) {
  const link =
    /https:\/\/\S+/.exec(
      await readMail(account.email, "Verify your Breakthrough account")
    )?.[0] ?? ""
  expect(new URL(link).origin, "Mail links stay on the issuer").toBe(
    accountsOrigin
  )
  await page.goto(link)
  await expect(
    page.getByRole("heading", { name: "Your email is verified." })
  ).toBeVisible()
}

/**
 * Signs in with the password on the issuer's own screen. A browser this account
 * has not used gets an emailed code first (new-device verification). Returns
 * the step the issuer chose after the password.
 */
export async function passwordOnIssuer(page: Page, account: Person) {
  const seen = await mailMark(account.email)
  await (await waitForHydrated(page.getByLabel("Username or email"))).fill(
    account.username
  )
  await page
    .locator("input")
    .and(page.getByLabel("Password", { exact: true }))
    .fill(account.password)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  // Reads the committed address only. A URL predicate (toHaveURL or
  // waitForURL) stalled the page on this cross-site hop in Playwright.
  await expect
    .poll(() => {
      const url = new URL(page.url())
      return url.origin === accountsOrigin && url.pathname === "/login"
    }, handoff)
    .toBe(false)
  const step = new URL(page.url()).pathname
  if (step !== "/verify-device") return step
  await expect(
    page.getByRole("heading", { name: "Confirm this browser" })
  ).toBeVisible()
  const code = sixDigitCode(
    await readMail(
      account.email,
      "Confirm a new browser for your Breakthrough account",
      seen
    )
  )
  await (
    await waitForHydrated(page.getByLabel("Email code", { exact: true }))
  ).fill(code)
  await page
    .getByRole("button", { name: "Confirm and sign in", exact: true })
    .click()
  return step
}
