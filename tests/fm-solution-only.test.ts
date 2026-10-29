// This repository is my public Frontend Mentor solution: a guest editor that
// saves in the browser. Sign-in, saved profiles and public profile pages live
// in my private suite app (royeradames/royer-links), so nothing here may
// depend on @royer/auth, read AUTH_* settings or install from a private
// registry.
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"

const json = (path: string) => JSON.parse(readFileSync(path, "utf8"))

test("no @royer/auth dependency in package.json or the lockfile", () => {
  const manifest = json("package.json")
  const declared = { ...manifest.dependencies, ...manifest.devDependencies }
  assert.equal(declared["@royer/auth"], undefined)
  const lock = readFileSync("bun.lock", "utf8")
  assert.doesNotMatch(lock, /@royer\/auth|@royeradames\/auth/)
})

test("setup.json lists no AUTH_* setting", () => {
  const setup = json("setup.json")
  const keys = (setup.env ?? []).map((entry: { key: string }) => entry.key)
  assert.deepEqual(keys.filter((key: string) => key.startsWith("AUTH_")), [])
})

test("installs need no GitHub Packages registry or NPM_TOKEN", () => {
  const npmrc = existsSync(".npmrc") ? readFileSync(".npmrc", "utf8") : ""
  assert.doesNotMatch(npmrc, /npm\.pkg\.github\.com|NPM_TOKEN|@royeradames:registry/)
})
