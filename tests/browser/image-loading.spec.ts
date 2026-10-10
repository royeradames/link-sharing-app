import { expect, test } from "@playwright/test"

for (const width of [400, 768, 1440]) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`the visible empty-editor illustration starts at high priority at ${width}px in ${colorScheme}`, async ({
      page,
      context,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme })
      const network = await context.newCDPSession(page)
      const requests: { url: string; priority: string }[] = []
      await network.send("Network.enable")
      await network.send("Network.setCacheDisabled", { cacheDisabled: true })
      network.on("Network.requestWillBeSent", event => {
        if (event.request.url.includes("/assets/get-starter-illustration.svg")) {
          requests.push({
            url: event.request.url,
            priority: event.request.initialPriority,
          })
        }
      })
      await page.goto("/dashboard/links")
      const image = page.locator(".empty-state img")
      await expect(image).toBeVisible()
      await image.evaluate(node => {
        if (!(node instanceof HTMLImageElement)) {
          throw new Error("The empty-editor illustration is missing")
        }
        return node.decode()
      })
      const box = await image.boundingBox()
      await testInfo.attach("illustration-request-priority", {
        body: JSON.stringify({ requests, box }),
        contentType: "application/json",
      })
      expect(box?.y).toBeLessThan(900)
      expect(requests).toHaveLength(1)
      expect(requests[0].priority).toMatch(/^(High|VeryHigh)$/)
      await expect(image).not.toHaveAttribute("loading", "lazy")
      await expect(image).toHaveAttribute("fetchpriority", "high")
    })
  }
}
