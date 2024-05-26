import Heading from "@/app/ui/Heading"
import Body from "@/app/ui/Body"
import Button from "@/app/ui/Button"
import Nav from "@/app/ui/Nav"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-8 items-center p-24">
      <Heading as="h1">Royer Adames</Heading>
      <Heading as="h1" size="small">
        Royer Adames
      </Heading>
      <Body>Body Medium Royer Adames</Body>
      <Body size="small">Body small Royer Adames</Body>
      <Button>Primary Button</Button>
      <Button disabled>Primary disable Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="secondary" disabled>
        Secondary disable Button
      </Button>
      <Nav isLinkActive></Nav>
      <Nav isProfileDetailsActive></Nav>
    </main>
  )
}
