// Removes the hosted suite's synthetic accounts from Devlinks' Preview schema
// by hand, for example after an interrupted run. The suite's own teardown does
// the same. Prints counts, never connection details.
//
//   POSTGRES_URL_NON_POOLING=… node scripts/cleanup-hosted-accounts.mjs
import { removeHostedAccounts } from "./hosted-accounts.mjs"

try {
  const { accounts, profiles, remaining } = await removeHostedAccounts(process.env.POSTGRES_URL_NON_POOLING)
  console.log(`devlinks_preview: removed ${accounts} accounts and ${profiles} profiles, remaining ${remaining}`)
  process.exitCode = remaining === 0 ? 0 : 1
} catch (error) {
  console.error(error instanceof Error ? error.message : "cleanup failed")
  process.exitCode = 1
}
