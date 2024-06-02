import { Button } from "@/app/ui/components/Button"
import Nav from "@/app/ui/components/Nav"
import { Logo } from "@/app/ui/components/Logo"

export function Header() {
  return (
    <header className="flex justify-between items-center self-stretch bg-white pl-6 pr-4 py-4 rounded-xl">
      <Logo />
      <Nav></Nav>
      <Button variant="secondary">Preview</Button>
    </header>
  )
}
