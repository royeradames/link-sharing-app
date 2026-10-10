import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

// The editor ships its validation to the browser. Full "zod" (also reached
// through "zod/v4") was a mostly unused 84 KB download on /dashboard/links.
// "zod/mini" checks the same rules, but importing its `z` object
// (`import { z } from "zod/mini"`) keeps every schema type in the Turbopack
// build; `import * as z` lets the bundler drop what the app does not use.
// zod/mini has no English default messages, so every check users can trip
// carries its own message. Run from the repository root, as `npm test` does.
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
        /from\s+["']zod(\/v4(\/classic)?)?["']/.test(source) ||
        /import\s*\{\s*z\s*\}\s*from\s+["']zod\/mini["']/.test(source)
      )
    })
  assert.deepEqual(offenders, [])
})
