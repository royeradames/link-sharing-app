import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { AllMenuList } from "@/app/ui/components/AllMenuList"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"
import { DragHandleButton } from "@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button"
import { RefObject } from "react"
import { InputField } from "@/app/ui/components/InputField"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formSchema } from "@/app/ui/demos/FormDemo"

export function LinkForm({
  orderNumber = 0,
  onRemove,
  edge,
  name,
  dragHandleRef,
}: {
  orderNumber: number
  onRemove: () => void
  edge: Edge | null
  name: number
  dragHandleRef: RefObject<HTMLButtonElement>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textField: "",
    },
  })
  function handlePlatFormChange() {
    //   todo: on click push a
  }

  return (
    <section className="flex flex-col justify-center items-stretch gap-3 self-stretch bg-light-grey p-5 rounded-xl">
      <header className="flex justify-between items-start self-stretch">
        <Heading
          as="h2"
          className="text-[color:var(--Grey,#737373)] text-base font-bold leading-[150%] flex gap-2 items-center"
        >
          {edge && <DropIndicator edge={edge} gap="1px" />}{" "}
          <DragHandleButton ref={dragHandleRef} label={`Reorder ${name}`} />{" "}
          Link #{orderNumber}
        </Heading>
        <button
          className="text-grey text-base font-normal leading-[150%]"
          onClick={onRemove}
        >
          Remove
        </button>
      </header>
      <div className="text-left">
        <Text as="label" htmlFor="platform">
          Platform
        </Text>
        {/*name links.${orderNumber}.platform*/}
        <AllMenuList onChange={handlePlatFormChange} />
      </div>
      <div className="text-left">
        <Text as="label" htmlFor="link">
          Link
        </Text>
        <InputField
          name={`links.${orderNumber}.link`}
          placeholder="e.g. https://www.github.com/johnappleseed"
          register={register}
          errors={errors}
          id="link"
        />
      </div>
    </section>
  )
}
