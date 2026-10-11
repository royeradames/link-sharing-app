import { test, expect, type Page } from "@playwright/test"
// The links editor keeps the Frontend Mentor layout's type sizes and colours
// (Figma "Desktop - Empty", "Tablet - Empty" and "Mobile - Empty"); the words
// are our own, because Devlinks serves a real shared account.
const intro =
  "Add up to five links, put them in the order you want, then save."
const emptyBody =
  "Press “Add new link” to add your first one. With two or more links, drag them or use Move up and Move down to set the order."

const px = (page: Page, selector: string, property: string) =>
  page
    .locator(selector)
    .first()
    .evaluate(
      (element, name) => getComputedStyle(element).getPropertyValue(name),
      property
    )

for (const { width, heading } of [
  { width: 1440, heading: "32px" },
  { width: 768, heading: "32px" },
  { width: 375, heading: "24px" }
]) {
  test(`the empty links editor uses our copy and ${heading} headings at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/dashboard/links")
    const main = page.locator("main")
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(
      "Your links"
    )
    await expect(main.getByText(intro, { exact: true })).toBeVisible()
    await expect(
      main.getByRole("heading", { name: "No links yet" })
    ).toBeVisible()
    await expect(main.getByText(emptyBody, { exact: true })).toBeVisible()
    expect(await px(page, "main h1", "font-size")).toBe(heading)
    expect(await px(page, ".empty-state h2", "font-size")).toBe(heading)
  })
}

test("header links use the design's purple and grey", async ({ page }) => {
  await page.goto("/dashboard/links")
  const nav = page.getByRole("navigation", { name: "Editor" })
  const color = (name: string) =>
    nav
      .getByRole("link", { name })
      .evaluate(element => getComputedStyle(element).color)
  expect(await color("Links")).toBe("rgb(99, 60, 255)")
  expect(await color("Profile details")).toBe("rgb(115, 115, 115)")
  expect(
    await page
      .getByRole("link", { name: "Saved preview" })
      .evaluate(element => getComputedStyle(element).color)
  ).toBe("rgb(99, 60, 255)")
})

test("the where-saves-go notice sits in the footer landmark, so the editor starts under the header", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1024 })
  await page.goto("/dashboard/links")
  await expect(page.locator("footer .local-notice")).toBeVisible()
  // Every visible top-level block is a landmark (or the skip link).
  const outside = await page.evaluate(() =>
    [...document.body.children]
      .filter(element => {
        const box = element.getBoundingClientRect()
        return box.width > 0 && box.height > 0
      })
      .filter(
        element =>
          !element.matches("header, main, footer, nav, .skip-link, script, next-route-announcer")
      )
      .map(element => element.outerHTML.slice(0, 80))
  )
  expect(outside).toEqual([])
  // Design: the editor panel starts 24 px under the header.
  const gap = await page.evaluate(() => {
    const header = document.querySelector(".site-header")!.getBoundingClientRect()
    const main = document.querySelector("main")!.getBoundingClientRect()
    return main.top - header.bottom
  })
  expect(gap).toBeGreaterThanOrEqual(0)
  expect(gap).toBeLessThanOrEqual(32)
})
