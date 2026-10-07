import { z } from "zod"

export const platforms = [
  { id: "github", name: "GitHub", hosts: ["github.com"], color: "#1a1a1a" },
  {
    id: "frontend-mentor",
    name: "Frontend Mentor",
    hosts: ["frontendmentor.io"],
    color: "#304c65"
  },
  {
    id: "twitter-x",
    name: "Twitter / X",
    hosts: ["twitter.com", "x.com"],
    color: "#222222"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    hosts: ["linkedin.com"],
    color: "#1758ca"
  },
  {
    id: "youtube",
    name: "YouTube",
    hosts: ["youtube.com", "youtu.be"],
    color: "#b32121"
  },
  {
    id: "facebook",
    name: "Facebook",
    hosts: ["facebook.com"],
    color: "#2442ac"
  },
  { id: "twitch", name: "Twitch", hosts: ["twitch.tv"], color: "#8630a7" },
  { id: "dev-to", name: "Dev.to", hosts: ["dev.to"], color: "#333333" },
  {
    id: "codewars",
    name: "Codewars",
    hosts: ["codewars.com"],
    color: "#8a1a50"
  },
  {
    id: "freecodecamp",
    name: "freeCodeCamp",
    hosts: ["freecodecamp.org"],
    color: "#302267"
  },
  { id: "gitlab", name: "GitLab", hosts: ["gitlab.com"], color: "#a53615" },
  {
    id: "hashnode",
    name: "Hashnode",
    hosts: ["hashnode.com", "hashnode.dev"],
    color: "#0330d1"
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    hosts: ["stackoverflow.com"],
    color: "#934400"
  }
]
export const MAX_IMAGE_BYTES = 256 * 1024
export const MAX_DOCUMENT_CHARS = 400_000
export const STORAGE_KEY = "devlinks.saved-draft.v1"
const name = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(80, "Use 80 characters or fewer.")
const image = z
  .string()
  .max(350_000)
  .refine(
    value =>
      value === "" ||
      /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(value),
    "Choose a PNG or JPEG image."
  )
const profileFields = {
  firstName: name.or(z.literal("")),
  lastName: name.or(z.literal("")),
  email: z.email("Enter a valid email.").max(254).or(z.literal("")),
  image
}
export const profileSchema = z
  .object({ ...profileFields, firstName: name, lastName: name })
  .strict()

export function destinationError(
  platform: string,
  value: string
): string | undefined {
  if (/[\u0000-\u0020\u007f]/.test(value))
    return "Use a URL without spaces or control characters."
  const selected = platforms.find(option => option.id === platform)
  if (!selected) return "Choose a supported platform."
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return "Use an HTTPS URL without a username, password or custom port."
    const host = url.hostname.replace(/^www\./, "")
    const allowed = selected.hosts.some(
      domain =>
        host === domain ||
        (platform === "hashnode" && host.endsWith(`.${domain}`))
    )
    if (!allowed) return `Use a ${selected.name} URL.`
  } catch {
    return "Enter a complete HTTPS URL."
  }
}
export const linkSchema = z
  .object({
    id: z.uuid(),
    platform: z
      .string()
      .refine(
        value => platforms.some(platform => platform.id === value),
        "Choose a supported platform."
      ),
    url: z
      .string()
      .trim()
      .min(1, "Enter a link.")
      .max(2048, "Use a shorter URL.")
  })
  .strict()
  .superRefine((link, ctx) => {
    if (!platforms.some(platform => platform.id === link.platform)) return
    const error = destinationError(link.platform, link.url)
    if (error) ctx.addIssue({ code: "custom", path: ["url"], message: error })
  })
export const linksSchema = z
  .array(linkSchema)
  .max(5, "You can save up to five links.")
  .superRefine((links, ctx) => {
    if (new Set(links.map(link => link.id)).size !== links.length)
      ctx.addIssue({
        code: "custom",
        message: "Each link needs a unique identifier."
      })
  })
export const draftSchema = z
  .object({ profile: z.object(profileFields).strict(), links: linksSchema })
  .strict()
export const documentSchema = z
  .object({ version: z.literal(1), revision: z.uuid(), draft: draftSchema })
  .strict()
export type Draft = z.infer<typeof draftSchema>
export type SavedDocument = z.infer<typeof documentSchema>
export type Section = "profile" | "links"
export const emptyDraft = (): Draft => ({
  profile: { firstName: "", lastName: "", email: "", image: "" },
  links: []
})
export function parseDocument(raw: string): SavedDocument {
  if (raw.length > MAX_DOCUMENT_CHARS)
    throw new Error("Saved draft is too large.")
  return documentSchema.parse(JSON.parse(raw))
}
export function moveLink(
  links: Draft["links"],
  id: string,
  targetId: string
): Draft["links"] {
  const from = links.findIndex(link => link.id === id)
  const to = links.findIndex(link => link.id === targetId)
  if (from < 0 || to < 0 || from === to) return links
  const result = [...links]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}
export function copyText(draft: Draft): string {
  return draft.links.map(link => link.url).join("\n")
}
