import { test, expect } from "@playwright/test"

// Frontend Mentor solution report, October 13, 2026: required fields said
// "(required)" only in their label, and no test covered an empty link URL.
const storageKey = "devlinks.saved-draft.v1"

test("required profile fields and the link URL are marked required on the input itself", async ({
  page
}) => {
  await page.goto("/dashboard/profile-details")
  await expect(page.getByLabel("First name (required)")).toHaveAttribute(
    "aria-required",
    "true"
  )
  await expect(page.getByLabel("Last name (required)")).toHaveAttribute(
    "aria-required",
    "true"
  )
  await expect(page.getByLabel("Email (optional)")).not.toHaveAttribute(
    "aria-required",
    "true"
  )
  await page.goto("/dashboard/links")
  await page.getByRole("button", { name: "+ Add new link", exact: true }).click()
  await expect(page.getByLabel("Link URL").last()).toHaveAttribute(
    "aria-required",
    "true"
  )
})

test("an empty link URL is refused, named and focused, and nothing is saved", async ({
  page
}) => {
  await page.goto("/dashboard/links")
  await expect(
    page.getByRole("heading", { name: "Customize your links" })
  ).toBeVisible()
  await page.getByRole("button", { name: "+ Add new link", exact: true }).click()
  const row = page.locator(".link-row").last()
  const platform = row.getByRole("combobox", { name: "Platform" })
  await platform.click()
  await platform.fill("GitHub")
  await row.getByRole("option", { name: "GitHub", exact: true }).click()
  await page.getByRole("button", { name: "Save links", exact: true }).click()
  const url = row.getByLabel("Link URL")
  await expect(row.getByText("Enter a link.", { exact: true })).toBeVisible()
  await expect(url).toHaveAttribute("aria-invalid", "true")
  await expect(url).toBeFocused()
  await expect(
    page.getByRole("status").filter({ hasText: "Nothing was saved." })
  ).toBeVisible()
  expect(
    await page.evaluate(key => localStorage.getItem(key), storageKey)
  ).toBeNull()
})
