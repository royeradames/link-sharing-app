import test from "node:test"
import assert from "node:assert/strict"
import {
  copyText,
  destinationError,
  emptyDraft,
  linksSchema,
  MAX_DOCUMENT_CHARS,
  moveLink,
  parseDocument,
  profileSchema
} from "../lib/draft.ts"
const one = {
  id: "e0ed35b9-a727-4fb0-ac7c-c978484214a4",
  platform: "github",
  url: "https://github.com/example"
}
const two = {
  id: "d6159e83-55a4-419e-8d3d-728901e82bf9",
  platform: "youtube",
  url: "https://youtube.com/@example"
}
test("all thirteen platforms accept their HTTPS destinations and reject another platform", () => {
  const examples = [
    ["github", "https://github.com/example"],
    ["frontend-mentor", "https://www.frontendmentor.io/profile/example"],
    ["twitter-x", "https://x.com/example"],
    ["linkedin", "https://www.linkedin.com/in/example"],
    ["youtube", "https://youtu.be/example"],
    ["facebook", "https://facebook.com/example"],
    ["twitch", "https://www.twitch.tv/example"],
    ["dev-to", "https://dev.to/example"],
    ["codewars", "https://www.codewars.com/users/example"],
    ["freecodecamp", "https://www.freecodecamp.org/example"],
    ["gitlab", "https://gitlab.com/example"],
    ["hashnode", "https://example.hashnode.dev"],
    ["stackoverflow", "https://stackoverflow.com/users/1/example"]
  ]
  for (const [platform, url] of examples) {
    assert.equal(destinationError(platform, url), undefined, url)
    assert.ok(destinationError(platform, "https://unrelated.example/path"))
  }
})
test("unsafe or misleading URLs and unknown platforms are rejected", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "http://github.com/example",
    "https://github.com.evil.example/path",
    "https://user:pass@github.com/example",
    "https://github.com:444/example",
    "https://github.com/ex\nample",
    "",
    "github.com/example"
  ])
    assert.ok(destinationError("github", url), url)
  assert.ok(destinationError("unknown", one.url))
})
test("save validation rejects missing profile names, invalid email, duplicate IDs and sixth link", () => {
  assert.equal(profileSchema.safeParse(emptyDraft().profile).success, false)
  assert.equal(
    profileSchema.safeParse({
      firstName: "Demo",
      lastName: "Reader",
      email: "invalid",
      image: ""
    }).success,
    false
  )
  assert.equal(linksSchema.safeParse([one, one]).success, false)
  assert.equal(
    linksSchema.safeParse(
      Array.from({ length: 6 }, () => ({ ...one, id: crypto.randomUUID() }))
    ).success,
    false
  )
})
test("saved document roundtrip preserves profile, identifiers, order and exact copied URLs", () => {
  const document = {
    version: 1,
    revision: "0f134116-81aa-42b8-b846-c900ce520847",
    draft: {
      profile: {
        firstName: "Demo",
        lastName: "Reader",
        email: "reader@example.invalid",
        image: ""
      },
      links: [two, one]
    }
  }
  assert.deepEqual(parseDocument(JSON.stringify(document)), document)
  assert.equal(
    copyText(document.draft),
    "https://youtube.com/@example\nhttps://github.com/example"
  )
})
test("malformed, unknown-version and oversized records are rejected", () => {
  for (const raw of [
    "{",
    "null",
    JSON.stringify({ version: 2 }),
    " ".repeat(MAX_DOCUMENT_CHARS + 1)
  ])
    assert.throws(() => parseDocument(raw))
})
test("reordering preserves IDs and inputs and invalid targets leave the list alone", () => {
  const links = [one, two]
  assert.deepEqual(moveLink(links, one.id, two.id), [two, one])
  assert.deepEqual(links, [one, two])
  assert.equal(moveLink(links, "missing", two.id), links)
})

test("an unknown platform is reported on the platform control rather than a valid URL", () => {
  const result = linksSchema.safeParse([{ ...one, platform: "" }])
  assert.equal(result.success, false)
  if (result.success) throw new Error("Missing platform was accepted")
  assert.deepEqual(
    result.error.issues.map(issue => issue.path),
    [[0, "platform"]]
  )
})
