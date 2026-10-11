import test from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

// Devlinks serves a real shared account, so everything it ships is ours or
// openly licensed. Each served file is listed here with where it comes from;
// a new file needs a line, so nothing arrives unexamined.
const root = join(import.meta.dirname, "..")
const served: Record<string, string> = {
  "app/icon.svg": "our own mark",
  "app/apple-icon.png": "our own mark, rendered at 180 px",
  "public/assets/logo/mark.svg": "our own mark",
  "public/assets/empty-links.svg": "our own empty-editor drawing",
  "public/assets/icons/link.svg": "Phosphor Icons link-bold, MIT",
  "public/assets/icons/user-circle.svg": "Phosphor Icons user-circle-bold, MIT",
  "public/assets/icons/lock-key.svg": "Phosphor Icons lock-key-bold, MIT",
  "public/assets/icons/eye.svg": "Phosphor Icons eye-bold, MIT",
  "public/fonts/InstrumentSans.ttf": "Instrument Sans, SIL OFL 1.1",
  "public/fonts/OFL.txt": "the Instrument Sans licence"
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

test("every served image, icon and font is listed with its source", () => {
  const found = [
    ...files(join(root, "public")),
    ...files(join(root, "app")).filter(path =>
      /\.(ico|png|jpe?g|svg|webp)$/.test(path)
    )
  ]
    .map(path => relative(root, path))
    .sort()
  assert.deepEqual(found, Object.keys(served).sort())
})

// Path data from the Frontend Mentor design's exports (wordmark, logo mark,
// empty-editor illustration, phone mockup) and its sentences.
const starter = [
  "M13.9972 26.15V22.195",
  "M6.5235 34.2252",
  "M24.3466 7.96062",
  "M1 54.5C1 24.9528",
  "M1 45.5C1 20.9233",
  "Customize your links",
  "Add/edit/remove links below",
  "Let’s get you started",
  "Let's get you started",
  "We’re here to help you share your profiles",
  "get-starter-illustration"
]

test("no shipped source carries the design's artwork or sentences", () => {
  const hits = ["app", "components", "lib", "public"]
    .flatMap(dir => files(join(root, dir)))
    .filter(path => /\.(tsx?|css|svg|json)$/.test(path))
    .flatMap(path => {
      const text = readFileSync(path, "utf8")
      return starter
        .filter(needle => text.includes(needle))
        .map(needle => `${relative(root, path)}: ${needle}`)
    })
  assert.deepEqual(hits, [])
})
