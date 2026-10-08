import { test, expect, type Page } from "@playwright/test"
const storageKey = "devlinks.saved-draft.v1"
async function addLink(
  page: Page,
  platform = "GitHub",
  url = "https://github.com/example"
) {
  await page
    .getByRole("button", { name: "+ Add new link", exact: true })
    .click()
  const row = page.locator(".link-row").last()
  await row.locator("summary").click()
  await row.getByLabel("Search platforms").fill(platform)
  await row.getByRole("button", { name: platform, exact: true }).click()
  await row.getByLabel("Link URL").fill(url)
}
async function go(page: Page) {
  await page.goto("/dashboard/links")
  await expect(
    page.getByRole("heading", { name: "Customize your links" })
  ).toBeVisible()
}
async function saveLinks(page: Page) {
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Links saved in this browser." })
  ).toBeVisible()
}
function errors(page: Page) {
  const output: string[] = []
  page.on("pageerror", error => output.push(error.message))
  page.on("console", message => {
    if (message.type() === "error") output.push(message.text())
  })
  return output
}

test("saved profile and links survive navigation/reload while unsaved changes remain separate", async ({
  page
}) => {
  const failures = errors(page)
  await go(page)
  await addLink(page)
  await saveLinks(page)
  await page.getByRole("link", { name: "Profile details", exact: true }).click()
  await page.getByLabel("First name (required)").fill("Demo")
  await page.getByLabel("Last name (required)").fill("Reader")
  await page.getByLabel("Email (optional)").fill("reader@example.invalid")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Profile saved" })
  ).toBeVisible()
  await page.getByLabel("First name (required)").fill("Unsaved")
  await page.getByRole("link", { name: "Saved preview", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Demo Reader" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Unsaved Reader" })
  ).toHaveCount(0)
  await page.getByRole("link", { name: "Profile details", exact: true }).click()
  await expect(page.getByLabel("First name (required)")).toHaveValue("Unsaved")
  await page.reload()
  await expect(page.getByLabel("First name (required)")).toHaveValue("Demo")
  await page.getByRole("link", { name: "Links", exact: true }).click()
  await expect(page.getByLabel("Link URL")).toHaveValue(
    "https://github.com/example"
  )
  expect(failures).toEqual([])
})
test("five-link capacity, platform search, native reordering and removal preserve the saved list until Save", async ({
  page
}) => {
  await go(page)
  await addLink(page)
  await addLink(page, "YouTube", "https://youtube.com/@example")
  await saveLinks(page)
  await page
    .getByRole("button", { name: "Move up Link #2", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Link URL").first()).toHaveValue(
    "https://youtube.com/@example"
  )
  await page
    .getByRole("button", { name: "Move down Link #1", exact: true })
    .focus()
  await page.keyboard.press("Space")
  await expect(page.getByLabel("Link URL").first()).toHaveValue(
    "https://github.com/example"
  )
  await page
    .getByRole("button", { name: "Move up Link #2", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  await page.locator(".link-row").nth(1).scrollIntoViewIfNeeded()
  await page
    .getByRole("button", { name: "Drag link 1", exact: true })
    .dragTo(page.locator(".link-row").nth(1))
  await expect(page.getByLabel("Link URL").first()).toHaveValue(
    "https://github.com/example"
  )
  await page.getByRole("button", { name: "Remove Link #1", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Save links", exact: true })
  ).toBeEnabled()
  await page.getByRole("link", { name: "Saved preview", exact: true }).click()
  await expect(page.locator(".saved-links a")).toHaveCount(2)
  await page.getByRole("link", { name: "Back to editor" }).click()
  for (let i = 0; i < 4; i++)
    await addLink(page, "GitLab", `https://gitlab.com/example${i}`)
  await expect(
    page.getByRole("button", { name: "+ Add new link", exact: true })
  ).toBeDisabled()
  const picker = page.locator(".platform-picker").first()
  await picker.locator("summary").click()
  await picker.getByLabel("Search platforms").fill("zzzz")
  await expect(picker.getByText("No matching platforms.")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(picker.locator("summary")).toBeFocused()
  await expect(picker.locator("summary")).toContainText("YouTube")
})
test("URL errors are visible and cannot replace saved content", async ({
  page
}) => {
  await go(page)
  await addLink(page)
  await saveLinks(page)
  const before = await page.evaluate(
    key => localStorage.getItem(key),
    storageKey
  )
  for (const url of [
    "https://youtube.com/@wrong-platform",
    "javascript:alert(1)",
    "https://github.com.evil.example/path"
  ]) {
    await page.getByLabel("Link URL").fill(url)
    await page.getByRole("button", { name: "Save links", exact: true }).click()
    await expect(page.getByLabel("Link URL")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    expect(
      await page.evaluate(key => localStorage.getItem(key), storageKey)
    ).toBe(before)
  }
})
test("clipboard copies only saved URLs and denial provides a selected plaintext fallback", async ({
  page,
  context
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await go(page)
  await addLink(page)
  await saveLinks(page)
  await page.getByLabel("Link URL").fill("https://github.com/not-saved")
  await page.getByRole("link", { name: "Saved preview", exact: true }).click()
  await page.getByRole("button", { name: "Copy links", exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "https://github.com/example"
  )
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: async () => {
        throw new DOMException("Denied", "NotAllowedError")
      }
    })
  })
  await page.getByRole("button", { name: "Copy links", exact: true }).click()
  await expect(page.getByLabel("Saved links to copy")).toHaveValue(
    "https://github.com/example"
  )
  await expect(page.getByLabel("Saved links to copy")).toBeFocused()
})
test("quota failure retains both stored draft and visible unsaved edits", async ({
  page
}) => {
  await go(page)
  await addLink(page)
  await saveLinks(page)
  const before = await page.evaluate(
    key => localStorage.getItem(key),
    storageKey
  )
  await page.evaluate(key => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException("Full", "QuotaExceededError")
      original.call(this, name, value)
    }
  }, storageKey)
  await page.getByLabel("Link URL").fill("https://github.com/changed")
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "The draft was not saved" })
  ).toBeVisible()
  await expect(page.getByLabel("Link URL")).toHaveValue(
    "https://github.com/changed"
  )
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBe(before)
  await page.getByRole("link", { name: "Saved preview", exact: true }).click()
  await expect(page.locator(".saved-links a")).toHaveAttribute(
    "href",
    "https://github.com/example"
  )
})
test("two tabs cannot overwrite a changed saved draft", async ({
  page,
  context
}) => {
  await go(page)
  const other = await context.newPage()
  await go(other)
  await addLink(page)
  await saveLinks(page)
  await addLink(other, "GitLab", "https://gitlab.com/example")
  await other.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(
    other
      .getByRole("status")
      .filter({ hasText: "Another tab changed the saved draft. Your edits" })
  ).toBeVisible()
  await expect(other.getByLabel("Link URL")).toHaveValue(
    "https://gitlab.com/example"
  )
  await page.reload()
  await expect(page.getByLabel("Link URL")).toHaveValue(
    "https://github.com/example"
  )
  await other.close()
})
test("malformed draft recovery is explicit and cancellation changes nothing", async ({
  page
}) => {
  await page.goto("/")
  await page.evaluate(key => localStorage.setItem(key, "{broken"), storageKey)
  await page.reload()
  await expect(
    page.getByRole("region", { name: "Draft recovery" })
  ).toBeVisible()
  page.once("dialog", dialog => dialog.dismiss())
  await page.getByRole("button", { name: "Reset unreadable draft" }).click()
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBe("{broken")
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download existing draft" }).click()
  expect((await download).suggestedFilename()).toBe(
    "devlinks-draft-backup.json"
  )
  page.once("dialog", dialog => dialog.accept())
  await page.getByRole("button", { name: "Reset unreadable draft" }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Local draft reset" })
  ).toBeVisible()
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBeNull()
})
test("blocked storage keeps editor honest and does not restore credential collection", async ({
  page
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError")
    }
  })
  await go(page)
  await expect(
    page.getByRole("button", { name: "Save links", exact: true })
  ).toBeDisabled()
  await expect(
    page.getByRole("region", { name: "Storage unavailable" })
  ).toBeVisible()
  await page.goto("/login")
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await expect(
    page.getByRole("link", { name: "Open local editor" })
  ).toBeVisible()
})
test("decoded PNG persists, invalid images and canceled selection preserve it", async ({
  page
}) => {
  await page.goto("/dashboard/profile-details")
  await page.getByLabel("First name (required)").fill("Demo")
  await page.getByLabel("Last name (required)").fill("Reader")
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas")
    c.width = 16
    c.height = 16
    const ctx = c.getContext("2d")
    if (!ctx) throw new Error("No canvas")
    ctx.fillStyle = "purple"
    ctx.fillRect(0, 0, 16, 16)
    return c.toDataURL("image/png")
  })
  const input = page.getByLabel("Profile picture", { exact: true })
  await input.setInputFiles({
    name: "synthetic.png",
    mimeType: "image/png",
    buffer: Buffer.from(png.split(",")[1], "base64")
  })
  await expect(page.getByAltText("Selected profile picture")).toHaveAttribute(
    "src",
    png
  )
  await input.setInputFiles([])
  await expect(page.getByAltText("Selected profile picture")).toHaveAttribute(
    "src",
    png
  )
  await input.setInputFiles({
    name: "fake.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image")
  })
  await expect(page.locator("#image-error")).toContainText("does not match")
  await expect(page.getByAltText("Selected profile picture")).toHaveAttribute(
    "src",
    png
  )
  await input.setInputFiles({
    name: "large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(262145)
  })
  await expect(page.locator("#image-error")).toContainText("256 KB")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Profile saved" })
  ).toBeVisible()
  await page.reload()
  await expect(page.getByAltText("Selected profile picture")).toHaveAttribute(
    "src",
    png
  )
})
test("required profile fields and optional-email validation have visible errors", async ({
  page
}) => {
  await page.goto("/dashboard/profile-details")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByLabel("First name (required)")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await expect(page.getByLabel("Last name (required)")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await page.getByLabel("First name (required)").fill("Demo")
  await page.getByLabel("Last name (required)").fill("Reader")
  await page.getByLabel("Email (optional)").fill("invalid")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByLabel("Email (optional)")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
})
test("layouts remain readable, keyboard usable and contained at family widths", async ({
  page
}, testInfo) => {
  const failures = errors(page)
  for (const width of [400, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of [
      "/",
      "/dashboard/links",
      "/dashboard/profile-details",
      "/preview"
    ]) {
      await page.goto(route)
      await expect(page.locator("main h1")).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({
        path: `.test-state/screenshots/${width}-${route.replaceAll("/", "-") || "home"}.png`,
        fullPage: true
      })
      const profileBounds = route === "/dashboard/profile-details"
        ? await page.locator("#profile-image").evaluate(input => {
            const wrapper = input.parentElement
            const group = wrapper?.parentElement
            if (!wrapper || !group) throw new Error("Profile image field is missing")
            const field = input.getBoundingClientRect()
            const content = wrapper.getBoundingClientRect()
            const outer = group.getBoundingClientRect()
            const style = getComputedStyle(group)
            return {
              viewportWidth: innerWidth,
              documentWidth: document.documentElement.scrollWidth,
              inputLeft: field.left,
              inputRight: field.right,
              wrapperLeft: content.left,
              wrapperRight: content.right,
              availableLeft: outer.left + parseFloat(style.paddingLeft),
              availableRight: outer.right - parseFloat(style.paddingRight),
              alignItems: style.alignItems,
            }
          })
        : null
      if (profileBounds) {
        await testInfo.attach(`profile-layout-${width}.json`, {
          body: Buffer.from(JSON.stringify(profileBounds, null, 2)),
          contentType: "application/json",
        })
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      expect(
        await page
          .locator("body")
          .evaluate(element => parseFloat(getComputedStyle(element).fontSize))
      ).toBeGreaterThanOrEqual(16)
      if (profileBounds) {
        expect(profileBounds.wrapperLeft).toBeGreaterThanOrEqual(
          Math.floor(profileBounds.availableLeft)
        )
        expect(profileBounds.wrapperRight).toBeLessThanOrEqual(
          Math.ceil(profileBounds.availableRight)
        )
        expect(profileBounds.inputLeft).toBeGreaterThanOrEqual(
          Math.floor(profileBounds.wrapperLeft)
        )
        expect(profileBounds.inputRight).toBeLessThanOrEqual(
          Math.ceil(profileBounds.wrapperRight)
        )
      }
    }
  }
  await go(page)
  await page
    .getByRole("button", { name: "+ Add new link", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  await expect(page.locator(".platform-picker summary")).toBeFocused()
  await page.keyboard.press("Enter")
  await page.keyboard.press("Tab")
  await expect(page.getByLabel("Search platforms")).toBeFocused()
  await page.keyboard.type("github")
  await page.keyboard.press("Tab")
  await page.keyboard.press("Enter")
  await expect(page.locator(".platform-picker summary")).toContainText("GitHub")
  expect(failures).toEqual([])
})

for (const saveNewer of [false, true]) {
  test(`delayed saved-image reload preserves newer ${saveNewer ? "saved" : "unsaved"} edits`, async ({
    page
  }) => {
    const failures = errors(page)
    await page.goto("/")
    await page.evaluate(key => {
      const canvas = document.createElement("canvas")
      canvas.width = 16
      canvas.height = 16
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          revision: crypto.randomUUID(),
          draft: {
            profile: {
              firstName: "Demo",
              lastName: "Reader",
              email: "",
              image: canvas.toDataURL("image/png")
            },
            links: [
              {
                id: crypto.randomUUID(),
                platform: "github",
                url: "https://github.com/original"
              }
            ]
          }
        })
      )
    }, storageKey)
    await go(page)
    await expect(page.getByLabel("Link URL")).toHaveValue(
      "https://github.com/original"
    )
    const before = await page.evaluate(
      key => localStorage.getItem(key),
      storageKey
    )
    await page.evaluate(() => {
      const decode = HTMLImageElement.prototype.decode
      let delayNext = true
      HTMLImageElement.prototype.decode = async function () {
        const delayed = delayNext && this.src.startsWith("data:image/")
        if (delayed) {
          delayNext = false
          document.documentElement.dataset.decodePending = "true"
          await new Promise<void>(resolve =>
            document.addEventListener("release-test-decode", () => resolve(), {
              once: true
            })
          )
        }
        await decode.call(this)
        if (delayed) document.documentElement.dataset.decodeFinished = "true"
      }
    })
    page.once("dialog", dialog => dialog.accept())
    await page
      .getByRole("button", { name: "Load saved draft", exact: true })
      .click()
    await expect(page.locator("html")).toHaveAttribute(
      "data-decode-pending",
      "true"
    )
    await page.getByLabel("Link URL").fill("https://github.com/newer")
    if (saveNewer) await saveLinks(page)
    const expectedStored = await page.evaluate(
      key => localStorage.getItem(key),
      storageKey
    )
    if (saveNewer) expect(expectedStored).not.toBe(before)
    else expect(expectedStored).toBe(before)
    await page.evaluate(() =>
      document.dispatchEvent(new Event("release-test-decode"))
    )
    await expect(page.locator("html")).toHaveAttribute(
      "data-decode-finished",
      "true"
    )
    await expect(
      page
        .getByRole("status")
        .filter({
          hasText: saveNewer
            ? "Links saved in this browser."
            : "Load canceled because you made newer edits."
        })
    ).toBeVisible()
    await expect(page.getByLabel("Link URL")).toHaveValue(
      "https://github.com/newer"
    )
    expect(
      await page.evaluate(key => localStorage.getItem(key), storageKey)
    ).toBe(expectedStored)
    await page.getByRole("link", { name: "Saved preview", exact: true }).click()
    await expect(page.locator(".saved-links a")).toHaveAttribute(
      "href",
      saveNewer ? "https://github.com/newer" : "https://github.com/original"
    )
    expect(failures).toEqual([])
  })
}
test("invalid link errors follow stable rows through keyboard reorder and removal", async ({
  page
}) => {
  await go(page)
  await addLink(page)
  await addLink(page, "YouTube", "https://youtube.com/@example")
  await saveLinks(page)
  const before = await page.evaluate(
    key => localStorage.getItem(key),
    storageKey
  )
  const invalid = page.locator(".link-row").nth(1)
  const inputId = await invalid.getByLabel("Link URL").getAttribute("id")
  if (!inputId) throw new Error("Link URL needs a stable ID")
  await invalid.getByLabel("Link URL").fill("https://github.com/wrong-platform")
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(invalid.getByLabel("Link URL")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await page
    .getByRole("button", { name: "Move up Link #2", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Link URL").first()).toHaveAttribute(
    "id",
    inputId
  )
  await expect(page.getByLabel("Link URL").first()).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await expect(page.getByLabel("Link URL").nth(1)).toHaveAttribute(
    "aria-invalid",
    "false"
  )
  await expect(
    page
      .locator(".link-row")
      .first()
      .getByText("Use a YouTube URL.", { exact: true })
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Move down Link #1", exact: true })
    .focus()
  await page.keyboard.press("Space")
  await page.getByRole("button", { name: "Remove Link #1", exact: true }).click()
  await expect(page.getByLabel("Link URL")).toHaveAttribute("id", inputId)
  await expect(page.getByLabel("Link URL")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await expect(
    page.getByText("Use a YouTube URL.", { exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBe(before)
})
test("missing platform with a valid URL identifies the chooser, not the URL", async ({
  page
}) => {
  await go(page)
  await addLink(page)
  await saveLinks(page)
  const before = await page.evaluate(
    key => localStorage.getItem(key),
    storageKey
  )
  await page
    .getByRole("button", { name: "+ Add new link", exact: true })
    .click()
  const row = page.locator(".link-row").last()
  await row.getByLabel("Link URL").fill("https://github.com/example")
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(row.locator("summary")).toHaveAttribute("aria-invalid", "true")
  await expect(row.locator("summary")).toHaveAccessibleDescription(
    "Choose a supported platform."
  )
  await expect(
    row.getByText("Choose a supported platform.", { exact: true })
  ).toBeVisible()
  await expect(row.getByLabel("Link URL")).toHaveAttribute(
    "aria-invalid",
    "false"
  )
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBe(before)
})

test("welcome page is server-rendered without waiting for the local draft", async ({
  request,
}) => {
  const html = await (await request.get("/")).text()
  expect(html).toContain("<h1>Your links, ready to copy</h1>")
  expect(html).not.toContain("Loading your local draft")
})

async function statusLine(page: Page) {
  const state = page.locator(".save-state")
  return state.evaluate(element => {
    const chars: { char: string; left: number; right: number }[] = []
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? ""
      for (let i = 0; i < text.length; i++) {
        const range = document.createRange()
        range.setStart(node, i)
        range.setEnd(node, i + 1)
        const rect = range.getBoundingClientRect()
        if (text[i].trim() && rect.width)
          chars.push({ char: text[i], left: rect.left, right: rect.right })
      }
    }
    const dot = chars.findIndex(item => item.char === "·")
    return {
      text: element.textContent,
      gapBefore: dot > 0 ? chars[dot].left - chars[dot - 1].right : -1,
      gapAfter:
        dot >= 0 && dot < chars.length - 1
          ? chars[dot + 1].left - chars[dot].right
          : -1
    }
  })
}
test("link status line spaces its separator in every state and hides it from screen readers", async ({
  page
}) => {
  await go(page)
  const state = page.locator(".save-state")
  const expectState = async (text: string, spoken: string) => {
    await expect(state).toHaveText(text)
    const measured = await statusLine(page)
    expect(measured.text).toBe(text)
    // At least half an em of visible ink gap on each side of the dot.
    expect(measured.gapBefore, `gap before the dot in "${text}"`).toBeGreaterThanOrEqual(8)
    expect(measured.gapAfter, `gap after the dot in "${text}"`).toBeGreaterThanOrEqual(8)
    await expect(state.locator('[aria-hidden="true"]')).toHaveText("·")
    await expect(state).toMatchAriaSnapshot(`- paragraph: ${spoken}`)
  }
  await expectState(
    "No unsaved link changes · 0 of 5 links",
    "No unsaved link changes 0 of 5 links"
  )
  await addLink(page)
  await expectState(
    "Unsaved link changes · 1 of 5 links",
    "Unsaved link changes 1 of 5 links"
  )
  await saveLinks(page)
  await expectState(
    "No unsaved link changes · 1 of 5 links",
    "No unsaved link changes 1 of 5 links"
  )
  for (let i = 0; i < 4; i++)
    await addLink(page, "GitLab", `https://gitlab.com/example${i}`)
  await expectState(
    "Unsaved link changes · 5 of 5 links",
    "Unsaved link changes 5 of 5 links"
  )
})
test("keyboard help and platform caret align with the layout at family widths", async ({
  page
}) => {
  for (const width of [400, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of [
      "/",
      "/dashboard/links",
      "/dashboard/profile-details",
      "/preview"
    ]) {
      await page.goto(route)
      await expect(page.locator("main h1")).toBeVisible()
      const help = page.locator(".keyboard-help summary")
      await expect(help).toHaveText("Keyboard help")
      const bounds = await help.evaluate(summary => {
        const column = document.querySelector("main > :first-child")
        if (!column) throw new Error("Main content column is missing")
        return {
          help: summary.getBoundingClientRect().left,
          column: column.getBoundingClientRect().left
        }
      })
      expect(
        Math.abs(bounds.help - bounds.column),
        `${route} at ${width}: Keyboard help ${bounds.help}px, content column ${bounds.column}px`
      ).toBeLessThanOrEqual(1)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
    await go(page)
    await page
      .getByRole("button", { name: "+ Add new link", exact: true })
      .click()
    const summary = page.locator(".platform-picker summary").first()
    const caret = summary.locator('[aria-hidden="true"]')
    const gap = await caret.evaluate(element => {
      const control = element.closest("summary")
      if (!control) throw new Error("Platform control is missing")
      return (
        control.getBoundingClientRect().right -
        element.getBoundingClientRect().right
      )
    })
    expect(gap, `platform caret gap at ${width}`).toBeGreaterThanOrEqual(12)
  }
})
test("pending image checks keep save buttons focusable and busy instead of disabled", async ({
  page
}) => {
  await page.goto("/dashboard/profile-details")
  await expect(page.locator("main h1")).toBeVisible()
  await page.evaluate(() => {
    const decode = HTMLImageElement.prototype.decode
    HTMLImageElement.prototype.decode = async function () {
      await new Promise<void>(resolve =>
        document.addEventListener("release-test-decode", () => resolve(), {
          once: true
        })
      )
      return decode.call(this)
    }
  })
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas")
    c.width = 16
    c.height = 16
    return c.toDataURL("image/png")
  })
  await page.getByLabel("Profile picture", { exact: true }).setInputFiles({
    name: "synthetic.png",
    mimeType: "image/png",
    buffer: Buffer.from(png.split(",")[1], "base64")
  })
  await expect(
    page.getByRole("status").filter({ hasText: "Checking image…" })
  ).toBeVisible()
  const save = page.getByRole("button", { name: "Save profile", exact: true })
  for (const button of [
    save,
    page.getByRole("button", { name: "Load saved draft", exact: true })
  ]) {
    await expect(button).not.toHaveAttribute("disabled")
    await expect(button).toHaveAttribute("aria-disabled", "true")
    await button.focus()
    await expect(button).toBeFocused()
  }
  await expect(save).toHaveAttribute("aria-busy", "true")
  await save.focus()
  await page.keyboard.press("Enter")
  await expect(save).toBeFocused()
  await expect(
    page.getByRole("status").filter({ hasText: "Still checking the image." })
  ).toBeVisible()
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBeNull()
  await page.evaluate(() =>
    document.dispatchEvent(new Event("release-test-decode"))
  )
  await expect(save).not.toHaveAttribute("aria-busy", "true")
  await expect(page.getByAltText("Selected profile picture")).toBeVisible()
})
test("failed saves move focus to the first invalid field", async ({ page }) => {
  await go(page)
  await addLink(page)
  await addLink(page, "YouTube", "https://github.com/wrong-platform")
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(page.getByLabel("Link URL").nth(1)).toBeFocused()
  await page
    .getByRole("button", { name: "+ Add new link", exact: true })
    .click()
  const missing = page.locator(".link-row").last()
  await missing.getByLabel("Link URL").fill("https://github.com/example")
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  // The YouTube URL comes first in the form, so it keeps the focus.
  await expect(page.getByLabel("Link URL").nth(1)).toBeFocused()
  await page.getByLabel("Link URL").nth(1).fill("https://youtube.com/@example")
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  await expect(missing.locator("summary")).toBeFocused()

  await page.getByRole("link", { name: "Profile details", exact: true }).click()
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByLabel("First name (required)")).toBeFocused()
  await page.getByLabel("First name (required)").fill("Demo")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByLabel("Last name (required)")).toBeFocused()
  await page.getByLabel("Last name (required)").fill("Reader")
  await page.getByLabel("Email (optional)").fill("invalid")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByLabel("Email (optional)")).toBeFocused()
})
test("move up and move down keep focus on the moved row and announce its position", async ({
  page
}) => {
  await go(page)
  await addLink(page)
  await addLink(page, "YouTube", "https://youtube.com/@example")
  await addLink(page, "GitLab", "https://gitlab.com/example")
  const status = page.getByRole("status").filter({ hasText: "Link moved" })
  await page
    .getByRole("button", { name: "Move down Link #1", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Move down Link #2", exact: true })
  ).toBeFocused()
  await expect(page.getByLabel("Link URL").nth(1)).toHaveValue(
    "https://github.com/example"
  )
  await expect(status).toHaveText(
    "Link moved to position 2. Save links to keep this order."
  )
  await page
    .getByRole("button", { name: "Move down Link #2", exact: true })
    .click()
  // Move down is unavailable on the last row, so focus stays on its Move up.
  await expect(
    page.getByRole("button", { name: "Move up Link #3", exact: true })
  ).toBeFocused()
  await expect(status).toHaveText(
    "Link moved to position 3. Save links to keep this order."
  )
  await page.getByRole("button", { name: "Move up Link #3", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Move up Link #2", exact: true })
  ).toBeFocused()
  await page.getByRole("button", { name: "Move up Link #2", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Move down Link #1", exact: true })
  ).toBeFocused()
  await expect(page.getByLabel("Link URL").first()).toHaveValue(
    "https://github.com/example"
  )
  await expect(status).toHaveText(
    "Link moved to position 1. Save links to keep this order."
  )
})
test("home declares one site name in its identity, og:site_name and WebSite JSON-LD", async ({
  page,
  request
}) => {
  const html = await (await request.get("/")).text()
  expect(html).toContain('<meta property="og:site_name" content="Devlinks"/>')
  const match = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/
  )
  expect(match, "WebSite JSON-LD on the home page").not.toBeNull()
  expect(JSON.parse(match?.[1] ?? "{}")).toEqual({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Devlinks",
    url: "https://link-sharing-app-self.vercel.app/"
  })
  await page.goto("/")
  // Phones show the round mark and wider screens the wordmark; both say Devlinks.
  await expect(page.locator(".site-header .brand img:visible")).toHaveAttribute(
    "alt",
    "Devlinks"
  )
})
