import { randomBytes, randomUUID } from "node:crypto"
import type pg from "pg"
import {
  documentSchema,
  MAX_DOCUMENT_CHARS,
  MAX_IMAGE_BYTES,
  type Draft,
  type SavedDocument,
} from "../draft.ts"
import {
  defaultPublishing,
  PUBLIC_ID,
  publicView,
  publishingSchema,
  type PublicProfile,
  type Publishing,
} from "../publishing.ts"
import { serverRuntime, type Runtime } from "./runtime.ts"

/** A Breakthrough identity. App data is keyed by it, not by an email. */
export type Owner = { issuer: string; subject: string }
export type AccountProfile = {
  document: SavedDocument | null
  publicId: string | null
  publishing: Publishing
  publishingRevision: string | null
}
type Row = {
  public_id: string
  document: unknown
  publishing: unknown
  publishing_revision: string
}
const columns = `"public_id", "document", "publishing", "publishing_revision"`

/** The issuer subject linked to a signed-in local principal. */
export async function ownerFor(
  runtime: Runtime,
  userId: string
): Promise<Owner | null> {
  const { rows } = await runtime.db.query<{ subject: string }>(
    'select "subject" from "federationIdentity" where "userId" = $1 and "issuer" = $2',
    [userId, runtime.issuerURL]
  )
  return rows[0] ? { issuer: runtime.issuerURL, subject: rows[0].subject } : null
}

function toProfile(row: Row | undefined): AccountProfile {
  if (!row)
    return {
      document: null,
      publicId: null,
      publishing: defaultPublishing,
      publishingRevision: null,
    }
  return {
    document: documentSchema.parse(row.document),
    publicId: row.public_id,
    publishing: publishingSchema.parse(row.publishing),
    publishingRevision: row.publishing_revision,
  }
}

export async function readProfile(
  db: pg.Pool,
  owner: Owner
): Promise<AccountProfile> {
  const { rows } = await db.query<Row>(
    `select ${columns} from "devlinks_profiles" where "issuer" = $1 and "subject" = $2`,
    [owner.issuer, owner.subject]
  )
  return toProfile(rows[0])
}

/**
 * The browser checks image dimensions when a picture is chosen; the server
 * re-checks what it can without decoding: type, encoding and byte size.
 */
function imageFits(image: string) {
  if (!image) return true
  const base64 = image.slice(image.indexOf(",") + 1)
  return Buffer.from(base64, "base64").length <= MAX_IMAGE_BYTES
}

export class InvalidDraft extends Error {}

/**
 * Saves the whole draft as a new revision. `expectedRevision` is the revision
 * the editor loaded (null for an account that has never saved). Any other
 * current revision is a conflict, so a stale tab or another device never
 * silently overwrites newer work.
 */
export async function saveDraft(
  db: pg.Pool,
  owner: Owner,
  expectedRevision: string | null,
  draft: Draft
): Promise<{ kind: "saved"; profile: AccountProfile } | { kind: "conflict" }> {
  const document = documentSchema.parse({
    version: 1,
    revision: randomUUID(),
    draft,
  })
  if (
    JSON.stringify(document).length > MAX_DOCUMENT_CHARS ||
    !imageFits(document.draft.profile.image)
  )
    throw new InvalidDraft("This profile is too large to save.")
  if (expectedRevision) {
    const { rows } = await db.query<Row>(
      `update "devlinks_profiles" set "document" = $3, "revision" = $4, "updated_at" = now()
       where "issuer" = $1 and "subject" = $2 and "revision" = $5
       returning ${columns}`,
      [owner.issuer, owner.subject, document, document.revision, expectedRevision]
    )
    return rows[0]
      ? { kind: "saved", profile: toProfile(rows[0]) }
      : { kind: "conflict" }
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { rows } = await db.query<Row>(
        `insert into "devlinks_profiles" ("issuer", "subject", "public_id", "document", "revision", "publishing", "publishing_revision")
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict ("issuer", "subject") do nothing
         returning ${columns}`,
        [
          owner.issuer,
          owner.subject,
          newPublicId(),
          document,
          document.revision,
          defaultPublishing,
          randomUUID(),
        ]
      )
      return rows[0]
        ? { kind: "saved", profile: toProfile(rows[0]) }
        : { kind: "conflict" }
    } catch (error) {
      // A public ID collision is the only unique violation left; try another.
      if ((error as { code?: string }).code !== "23505" || attempt === 2)
        throw error
    }
  }
  throw new Error("unreachable")
}

/**
 * Publishing choices apply to an existing saved profile, compare-and-set on
 * the publishing revision the page loaded. "missing" means nothing is saved
 * yet; "conflict" means another tab or device changed the choices first.
 */
export async function savePublishing(
  db: pg.Pool,
  owner: Owner,
  expectedRevision: string,
  publishing: Publishing
): Promise<
  | { kind: "saved"; profile: AccountProfile }
  | { kind: "conflict" }
  | { kind: "missing" }
> {
  const { rows } = await db.query<Row>(
    `update "devlinks_profiles" set "publishing" = $3, "publishing_revision" = $4, "updated_at" = now()
     where "issuer" = $1 and "subject" = $2 and "publishing_revision" = $5
     returning ${columns}`,
    [owner.issuer, owner.subject, publishingSchema.parse(publishing), randomUUID(), expectedRevision]
  )
  if (rows[0]) return { kind: "saved", profile: toProfile(rows[0]) }
  const exists = await db.query(
    'select 1 from "devlinks_profiles" where "issuer" = $1 and "subject" = $2',
    [owner.issuer, owner.subject]
  )
  return exists.rowCount ? { kind: "conflict" } : { kind: "missing" }
}

const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
/** A stable, unguessable public address segment. It never changes once issued. */
function newPublicId() {
  return [...randomBytes(12)].map(byte => alphabet[byte % 36]).join("")
}

/**
 * The public page's data for /p/<publicId>: only the published fields of the
 * saved profile. Null when accounts are off here, the ID is malformed or
 * unknown, or the owner has not published.
 */
export async function publicProfileFor(
  publicId: string
): Promise<PublicProfile | null> {
  if (!PUBLIC_ID.test(publicId)) return null
  const runtime = serverRuntime()
  if (!runtime) return null
  const { rows } = await runtime.db.query<Row>(
    `select ${columns} from "devlinks_profiles" where "public_id" = $1`,
    [publicId]
  )
  if (!rows[0]) return null
  const profile = toProfile(rows[0])
  return profile.document
    ? publicView(profile.document.draft, profile.publishing)
    : null
}
