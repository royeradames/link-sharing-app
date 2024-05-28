import Heading from "@/app/ui/Heading"
import Text from "@/app/ui/Text"
import Button from "@/app/ui/Button"
import Nav from "@/app/ui/Nav"
import { FormDemo } from "@/app/ui/FormDemo"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-8 items-center p-24">
      <FormDemo />
      <Heading as="h1">Royer Adames</Heading>
      <Heading as="h1" size="small">
        Royer Adames
      </Heading>
      <Text>Body Medium Royer Adames</Text>
      <Text size="small">Body small Royer Adames</Text>
      <Button>Primary Button</Button>
      <Button disabled>Primary disable Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="secondary" disabled>
        Secondary disable Button
      </Button>
      <Nav></Nav>
      <Nav></Nav>
    </main>
  )
}
