// TEMPORARY (removed before merge): prints where npm resolved the private
// package during Vercel's install. Tarball URL and integrity only; no secrets.
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
const hidden = JSON.parse(readFileSync("node_modules/.package-lock.json", "utf8"))
const entry = hidden.packages["node_modules/@royer/auth"] ?? {}
console.log("REGISTRY-LOCK hidden " + JSON.stringify({ resolved: entry.resolved, integrity: entry.integrity }))
try {
  const dist = execFileSync("npm", ["view", "@royeradames/auth@0.1.0-rc.4", "dist.tarball", "dist.integrity", "--json"], { encoding: "utf8" })
  console.log("REGISTRY-LOCK view " + dist.replace(/\s+/g, " "))
} catch {
  console.log("REGISTRY-LOCK view failed")
}
