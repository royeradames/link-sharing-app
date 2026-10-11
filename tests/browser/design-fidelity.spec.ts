import { test, expect, type Page } from "@playwright/test"
// The links editor follows the Frontend Mentor design's copy, type sizes and
// colours (Figma "Desktop - Empty", "Tablet - Empty" and "Mobile - Empty").
const intro =
  "Add/edit/remove links below and then share all your profiles with the world!"
const emptyBody =
  "Use the “Add new link” button to get started. Once you have more than one link, you can reorder and edit them. We’re here to help you share your profiles with everyone!"

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
  test(`the empty links editor uses the design's copy and ${heading} headings at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/dashboard/links")
    const main = page.locator("main")
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(
      "Customize your links"
    )
    await expect(main.getByText(intro, { exact: true })).toBeVisible()
    await expect(
      main.getByRole("heading", { name: "Let’s get you started" })
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
