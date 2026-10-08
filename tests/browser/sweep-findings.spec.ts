import { test, expect } from "@playwright/test"
import { controlsOnOneLine, headerRowsDoNotStack } from "./layout-checks"

// Regression checks for the October 8, 2026 width-sweep fix packet
// (qa-fix-packets-20261008/link-sharing-app.md, items 1-4).

const routes = ["/", "/dashboard/links", "/dashboard/profile-details", "/preview"]

test("item 1: the phone header keeps its controls on one row from 320 to 700px", async ({
  page,
}) => {
  const findings = []
  for (const route of routes) {
    await page.goto(route)
    for (let width = 320; width <= 700; width += 10) {
      await page.setViewportSize({ width, height: 800 })
      const header = page.locator(".site-header")
      const box = await header.boundingBox()
      const controls = await header
        .locator("a, button")
        .evaluateAll((elements) =>
          elements
            .map((element) => element.getBoundingClientRect())
            .filter((rect) => rect.width > 0)
            .map((rect) => Math.round(rect.top + rect.height / 2))
        )
      // Controls whose centres are within 12px share a row.
      const rows = controls
        .sort((a, b) => a - b)
        .filter((middle, i, all) => i === 0 || middle - all[i - 1] > 12).length
      if (rows > 1 || (box?.height ?? 0) > 80)
        findings.push({ route, width, rows, height: box?.height })
      findings.push(
        ...(await headerRowsDoNotStack(page)).map((f) => ({ route, ...f })),
        ...(await controlsOnOneLine(page, "header")).map((f) => ({ route, ...f }))
      )
    }
  }
  expect(findings).toEqual([])
  // Phone tabs are icons; each still has its visible-text name for assistive tech.
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto("/dashboard/links")
  for (const name of ["Links", "Profile details", "Saved preview"])
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible()
})

test("item 2: save rows never squeeze their button labels from 320 to 400px", async ({
  page,
}) => {
  const findings = []
  for (const route of ["/dashboard/links", "/dashboard/profile-details"]) {
    await page.goto(route)
    for (let width = 320; width <= 400; width += 10) {
      await page.setViewportSize({ width, height: 800 })
      findings.push(
        ...(await controlsOnOneLine(page, ".save-actions")).map((f) => ({
          route,
          ...f,
        }))
      )
    }
  }
  expect(findings).toEqual([])
})

test("item 3: every editor route declares og:site_name and one WebSite JSON-LD", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('meta[property="og:site_name"]'), route).toHaveAttribute(
      "content",
      "Devlinks"
    )
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(
      blocks.map((block) => JSON.parse(block)).filter((data) => data["@type"] === "WebSite"),
      route
    ).toEqual([
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Devlinks",
        url: "https://link-sharing-app-self.vercel.app/",
      },
    ])
  }
})

test("item 4: Copy links with nothing saved stays focusable and says why", async ({
  page,
}) => {
  await page.goto("/preview")
  const copy = page.getByRole("button", { name: "Copy links", exact: true })
  // Not natively disabled: it stays in the tab order and explains itself.
  await expect(copy).not.toHaveAttribute("disabled", /.*/)
  await expect(copy).toHaveAttribute("aria-disabled", "true")
  await expect(copy).toHaveAccessibleDescription(
    "No saved links to copy yet. Add links in the editor and save them."
  )
  await copy.focus()
  await page.keyboard.press("Enter")
  await expect(copy).toBeFocused()
  await expect(page.getByRole("status").filter({ hasText: "Save at least one link" })).toBeVisible()
})

test("item 4: with unreadable saved data, Copy links says why instead of asking to save", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("devlinks.saved-draft.v1", "{broken"))
  await page.goto("/preview")
  const copy = page.getByRole("button", { name: "Copy links", exact: true })
  await expect(copy).toHaveAttribute("aria-disabled", "true")
  await expect(copy).toHaveAccessibleDescription(
    "Saved links can't be read right now. The message below the preview says what to do."
  )
})
