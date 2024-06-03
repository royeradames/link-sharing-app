"use client"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { Button } from "@/app/ui/components/Button"
import Image from "next/image"
import { LinkForm } from "@/app/links/LinkForm"

export function CustomizeLinks() {
  // todo: if empty then show the message if not then show the component
  // todo: how would the dynamic useArrayForm work? Like how does all of this connect to a form and zod validation
  // todo: maybe add a useContext to store the LinkFromGroup list
  const LinkFromGroup = []
  function handleAddNewLink() {
    // todo: add a new LinkForm Component to list
  }
  return (
    <section className=" bg-white flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch rounded-lg">
      <div className=" bg-white flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch p-6 text-center">
        <Heading as="h1">Customize your links</Heading>
        <Text as="p">
          Add/edit/remove links below and then share all your profiles with the
          world!
        </Text>
        {/*todo: needs a onClick event*/}
        {/*onClick={handleAddNewLink}*/}
        <Button variant="secondary">+ Add new link</Button>
        <div className="flex flex-col justify-center items-center gap-3 flex-[1_0_0] self-stretch [background:var(--Light-Grey,#FAFAFA)] p-5 rounded-xl">
          <Image
            src="assets/get-starter-illustration.svg"
            alt="Getting starter"
            width={124.766}
            height={80}
          />
          <Heading as="h2">Let’s get you started</Heading>
          <Text as="p">
            Use the “Add new link” button to get started. Once you have more
            than one link, you can reorder and edit them. We’re here to help you
            share your profiles with everyone!
          </Text>
        </div>
        <LinkForm orderNumber={1} />
      </div>

      <Button className="p-3 border-t border-borders rounded-b-lg" disabled>
        Save
      </Button>
    </section>
  )
}
