import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

// The editor ships its validation to the browser. Full "zod" was a mostly
// unused 84 KB download on /dashboard/links. "zod/mini", imported as a
// namespace, checks the same rules and lets the bundler drop what the app
// does not use.
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : []
  })
}

test("app code validates with zod/mini, imported as a namespace", () => {
  const offenders = ["app", "components", "lib"]
    .flatMap(sourceFiles)
    .filter(file => {
      const source = readFileSync(file, "utf8")
      return (
        /from\s+["']zod["']/.test(source) ||
        /import\s*\{[^}]*\}\s*from\s+["']zod\/mini["']/.test(source)
      )
    })
  assert.deepEqual(offenders, [])
})
