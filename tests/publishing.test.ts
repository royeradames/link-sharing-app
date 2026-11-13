import test from "node:test"
import assert from "node:assert/strict"
import { defaultPublishing, publicView, publishingSchema } from "../lib/publishing.ts"

const saved = {
  profile: {
    firstName: "Demo",
    lastName: "Reader",
    email: "reader@example.invalid",
    image: "data:image/png;base64,iVBORw0KGgo=",
  },
  links: [
    { id: "e0ed35b9-a727-4fb0-ac7c-c978484214a4", platform: "github", url: "https://github.com/example" },
    { id: "d6159e83-55a4-419e-8d3d-728901e82bf9", platform: "youtube", url: "https://youtube.com/@example" },
  ],
}

test("nothing is public until the owner publishes", () => {
  assert.equal(defaultPublishing.published, false)
  assert.equal(defaultPublishing.email, false, "email is private by default")
  assert.equal(publicView(saved, defaultPublishing), null)
})

test("a published view carries only the chosen fields, in saved order, without internal IDs", () => {
  const view = publicView(saved, { published: true, name: true, email: false, image: false, links: true })
  assert.deepEqual(view, {
    name: "Demo Reader",
    links: [
      { platform: "github", url: "https://github.com/example" },
      { platform: "youtube", url: "https://youtube.com/@example" },
    ],
  })
  const serialized = JSON.stringify(view)
  for (const secret of [saved.profile.email, saved.profile.image, saved.links[0].id])
    assert.ok(!serialized.includes(secret))
  assert.deepEqual(
    publicView(saved, { published: true, name: false, email: true, image: true, links: false }),
    { email: saved.profile.email, image: saved.profile.image, links: [] }
  )
})

test("publishing settings are strict booleans", () => {
  assert.equal(publishingSchema.safeParse({ ...defaultPublishing, extra: true }).success, false)
  assert.equal(publishingSchema.safeParse({ ...defaultPublishing, email: "yes" }).success, false)
})
