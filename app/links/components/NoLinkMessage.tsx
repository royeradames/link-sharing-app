import Image from "next/image"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { useLinksFormContext } from "@/app/links/LinksFormProvider"

export function NoLinkMessage() {
  const { fields } = useLinksFormContext()
  return (
    <>
      {!fields.length && (
        <div className="flex flex-col justify-center items-center gap-3 flex-[1_0_0] self-stretch bg-gray-100 p-5 rounded-xl">
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
    </>
  )
}
