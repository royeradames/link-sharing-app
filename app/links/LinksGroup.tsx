"use client"
import { Button } from "@/app/ui/components/Button"
import Image from "next/image"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { LinkForm } from "@/app/links/LinkForm"
import { useState } from "react"

export function LinksGroup() {
  const [LinkFromGroup, setLinkFromGroup] = useState<(typeof LinkForm)[]>([])
  function handleAddNewLink() {
    setLinkFromGroup(pastValue => [...pastValue, LinkForm])
  }
  return (
    <>
      <Button variant="secondary" onClick={handleAddNewLink}>
        + Add new link
      </Button>
      <div className="flex flex-col justify-center items-center gap-3 flex-[1_0_0] self-stretch [background:var(--Light-Grey,#FAFAFA)] p-5 rounded-xl">
        <Image
          src="assets/get-starter-illustration.svg"
          alt="Getting starter"
          width={124.766}
          height={80}
        />
        <Heading as="h2">Let’s get you started</Heading>
        <Text as="p">
          Use the “Add new link” button to get started. Once you have more than
          one link, you can reorder and edit them. We’re here to help you share
          your profiles with everyone!
        </Text>
      </div>
      <LinkForm orderNumber={1} />
      {LinkFromGroup.map((Element, key) => (
        <Element orderNumber={key + 1} key={key} />
      ))}
    </>
  )
}
