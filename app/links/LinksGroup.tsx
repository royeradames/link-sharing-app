"use client"
import { Button } from "@/app/ui/components/Button"
import Image from "next/image"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { LinkForm } from "@/app/links/LinkForm"
import { useState } from "react"
import { v4 } from "uuid"

export function LinksGroup() {
  const [LinkFromGroup, setLinkFromGroup] = useState<
    { form: typeof LinkForm; id: string | number }[]
  >([])
  function handleAddNewLink() {
    setLinkFromGroup(current => [
      ...current,
      {
        form: LinkForm,
        id: v4(),
      },
    ])
  }

  function handleRemove(key: number) {
    setLinkFromGroup(current => {
      console.log(current.filter((item, itemIndex) => itemIndex !== key))
      return current.filter((item, itemIndex) => itemIndex !== key)
    })
  }

  return (
    <>
      <Button variant="secondary" onClick={handleAddNewLink}>
        + Add new link
      </Button>
      {!LinkFromGroup.length && (
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
      )}
      {!!LinkFromGroup.length &&
        LinkFromGroup.map((Element, key) => (
          <Element.form
            orderNumber={key + 1}
            key={Element.id}
            onRemove={() => handleRemove(key)}
          />
        ))}
    </>
  )
}
