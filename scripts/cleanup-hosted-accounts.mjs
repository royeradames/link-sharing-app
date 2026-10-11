// Removes the hosted suite's synthetic accounts from Devlinks' Preview schema
// by hand, for example after an interrupted run. The suite's own teardown
// removes only its own run. Prints counts, never connection details.
//
//   POSTGRES_URL_NON_POOLING=… node scripts/cleanup-hosted-accounts.mjs --run <run id>
//   POSTGRES_URL_NON_POOLING=… node scripts/cleanup-hosted-accounts.mjs --all   (no hosted run in progress)
import { parseArgs } from "node:util"
import { everyRun, removeHostedAccounts } from "./hosted-accounts.mjs"

try {
  const { values } = parseArgs({ options: { run: { type: "string" }, all: { type: "boolean", default: false } } })
  if (values.all === Boolean(values.run)) throw new Error("Name one run with --run <id>, or pass --all when no hosted run is in progress.")
  const { accounts, profiles, remaining } = await removeHostedAccounts(process.env.POSTGRES_URL_NON_POOLING, values.all ? everyRun : values.run)
  console.log(`devlinks_preview: removed ${accounts} accounts and ${profiles} profiles, remaining ${remaining}`)
  process.exitCode = remaining === 0 ? 0 : 1
} catch (error) {
  console.error(error instanceof Error ? error.message : "cleanup failed")
  process.exitCode = 1
}
