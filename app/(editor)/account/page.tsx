import { openGraphFor } from "@/lib/site"
import { AccountPanel } from "@/components/account-panel"
export const metadata = {
  title: "Account",
  openGraph: openGraphFor("/account"),
}
export default function Page() {
  return <AccountPanel />
}
