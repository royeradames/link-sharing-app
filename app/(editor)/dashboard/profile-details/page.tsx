import { openGraphFor } from "@/lib/site"
import { ProfileEditor } from "@/components/profile-editor"
export const metadata = {
  title: "Profile details",
  openGraph: openGraphFor("/dashboard/profile-details"),
}
export default function Page() {
  return <ProfileEditor />
}
