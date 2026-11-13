import { z } from "zod"
import type { Draft } from "./draft.ts"

/**
 * What the owner chose to show on their public page. Nothing is public until
 * `published` is true, and email is private unless the owner turns it on.
 */
export const publishingSchema = z
  .object({
    published: z.boolean(),
    name: z.boolean(),
    email: z.boolean(),
    image: z.boolean(),
    links: z.boolean(),
  })
  .strict()
export type Publishing = z.infer<typeof publishingSchema>
export const defaultPublishing: Publishing = {
  published: false,
  name: true,
  email: false,
  image: true,
  links: true,
}
/** A public profile address: /p/<12 lowercase letters or digits>. */
export const PUBLIC_ID = /^[a-z0-9]{12}$/

export type PublicProfile = {
  name?: string
  email?: string
  image?: string
  links: { platform: string; url: string }[]
}

/**
 * The public page's data: only the fields the owner published, from the saved
 * profile, without internal link IDs. Null when the page is not published.
 */
export function publicView(
  draft: Draft,
  publishing: Publishing
): PublicProfile | null {
  if (!publishing.published) return null
  const view: PublicProfile = { links: [] }
  const { firstName, lastName, email, image } = draft.profile
  const name = [firstName, lastName].filter(Boolean).join(" ")
  if (publishing.name && name) view.name = name
  if (publishing.email && email) view.email = email
  if (publishing.image && image) view.image = image
  if (publishing.links)
    view.links = draft.links.map(({ platform, url }) => ({ platform, url }))
  return view
}
