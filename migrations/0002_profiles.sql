-- App-owned profile data, one row per Breakthrough identity (issuer + subject).
-- "document" is the saved {version, revision, draft} the editor already uses;
-- "revision" repeats its revision so a save is one compare-and-set.
-- "publishing" holds the owner's choices for the public page at /p/<public_id>.
create table if not exists "devlinks_profiles" (
  "issuer" text not null,
  "subject" text not null,
  "public_id" text not null unique check ("public_id" ~ '^[a-z0-9]{12}$'),
  "document" jsonb not null,
  "revision" uuid not null,
  "publishing" jsonb not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  primary key ("issuer", "subject")
);
