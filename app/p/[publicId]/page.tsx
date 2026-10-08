import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import { PublicPage } from "@/components/public-page"
import { PublicProfileCard } from "@/components/public-profile-card"
import { publicProfileFor } from "@/lib/server/profile-store"

export const dynamic = "force-dynamic"
type Props = { params: Promise<{ publicId: string }> }
const profileFor = cache(publicProfileFor)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await profileFor((await params).publicId)
  return {
    title: {
      absolute: profile?.name ? `${profile.name} on Devlinks` : "Devlinks profile",
    },
    description: "Links published on Devlinks.",
  }
}

/** A public profile at a stable address. Only what its owner published. */
export default async function Page({ params }: Props) {
  const profile = await profileFor((await params).publicId)
  if (!profile) notFound()
  return <PublicPage><PublicProfileCard profile={profile} /></PublicPage>
}
