"use client"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { Button } from "@/app/ui/components/Button"
import { LinksGroup } from "@/app/links/LinksGroup"
import { LinksSchemaType, useFormContext } from "@/app/links/FormProvider"

export function CustomizeLinks() {
  const { handleSubmit, fields } = useFormContext()
  const onSubmit = (data: LinksSchemaType) => {
    console.log(data)
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" bg-white flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch rounded-lg"
    >
      <div className=" bg-white flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch p-6 text-center">
        <Heading as="h1">Customize your links</Heading>
        <Text as="p">
          Add/edit/remove links below and then share all your profiles with the
          world!
        </Text>
        <LinksGroup fields={fields} />
      </div>

      <Button
        className="p-3 border-t border-borders rounded-b-lg"
        type="submit"
      >
        Save
      </Button>
    </form>
  )
}
