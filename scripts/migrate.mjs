// Applies the reviewed migrations to one named Devlinks schema.
//
//   node scripts/migrate.mjs --plan
//   vercel env run -e preview -- node scripts/migrate.mjs \
//     --environment=preview --reviewed-sha256=<combined hash from --plan>
//
// The schema comes from --environment (preview -> devlinks_preview,
// production -> devlinks) and must match VERCEL_ENV when that is set. Output
// holds names and hashes only, never connection details.
import pg from "pg"
import { applyMigrations, combinedHash, readMigrations, SCHEMAS } from "./migrations.mjs"

const option = name =>
  process.argv.find(value => value.startsWith(`--${name}=`))?.split("=")[1]
const migrations = await readMigrations()
const hash = combinedHash(migrations)

if (process.argv.includes("--plan")) {
  console.log(
    JSON.stringify(
      { planned: migrations.map(({ name, sha256 }) => ({ name, sha256 })), combinedSHA256: hash },
      null,
      2
    )
  )
  process.exit(0)
}

const environment = option("environment")
const schema = SCHEMAS[environment]
if (!schema) throw new Error("Name the target with --environment=preview or --environment=production.")
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== environment)
  throw new Error("--environment must match this environment's VERCEL_ENV.")
if (option("reviewed-sha256") !== hash)
  throw new Error("Supply the reviewed combined SHA-256 from --plan.")
const connectionString = process.env.POSTGRES_URL_NON_POOLING
if (!connectionString || new URL(connectionString).hostname.includes("-pooler"))
  throw new Error("Use the direct (unpooled) connection for migrations.")

const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10_000 })
try {
  await client.connect()
  const result = await applyMigrations(client, migrations, schema)
  console.log(JSON.stringify({ combinedSHA256: hash, ...result }))
} catch (error) {
  // SQL errors name the statement problem; connection errors could name hosts.
  const sqlState =
    error && typeof error === "object" && "code" in error && /^[0-9A-Z]{5}$/.test(String(error.code))
  const reason =
    sqlState || String(error?.message).startsWith("Migration ")
      ? String(error.message).slice(0, 200)
      : "connection or runtime failure"
  console.error(JSON.stringify({ failed: true, rolledBack: true, reason }))
  process.exitCode = 1
} finally {
  await client.end().catch(() => undefined)
}
