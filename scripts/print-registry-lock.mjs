// TEMPORARY (removed in the next commit): prints the registry resolution npm
// recorded for the private package during Vercel's install. No secrets.
import { readFileSync } from "node:fs"
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"))
console.log("REGISTRY-LOCK " + JSON.stringify({
  packages: lock.packages["node_modules/@royer/auth"],
  legacy: lock.dependencies?.["@royer/auth"],
}))
