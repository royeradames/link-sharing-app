import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"
import { DragHandleButton } from "@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button"
import { RefObject } from "react"
import { InputField } from "@/app/ui/inputs/InputField"
import { PlatformOptions } from "@/app/ui/inputs/SelectPlatformInput"
import { useLinksFormContext } from "@/app/links/components/LinksFormProvider"
import CustomSelectAccessable from "@/app/ui/inputs/CustomSelectAccessable"

export function LinkForm({
  index = 0,
  onRemove,
  edge,
  dragHandleRef,
}: {
  index: number
  onRemove: () => void
  edge: Edge | null
  dragHandleRef: RefObject<HTMLButtonElement>
}) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useLinksFormContext()

  return (
    <section className="flex flex-col justify-center items-stretch gap-3 self-stretch bg-light-grey p-5 rounded-xl">
      <header className="flex justify-between items-start self-stretch">
        <Heading
          as="h2"
          className="text-[color:var(--Grey,#737373)] text-base font-bold leading-[150%] flex gap-2 items-center"
        >
          {edge && <DropIndicator edge={edge} gap="1px" />}{" "}
          <DragHandleButton
            ref={dragHandleRef}
            label={`Reorder Link ${index + 1}`}
          />
          Link #{index + 1}
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
        {/*<SelectPlatformInput*/}
        {/*  name={`links.${index}.platform`}*/}
        {/*  register={register}*/}
        {/*/>*/}

        <CustomSelectAccessable
          options={PlatformOptions}
          placeholder="Select an option"
          onSelect={option => console.log(option)}
          register={register}
          setValue={setValue}
          name={`links.${index}.platform`}
        />
        {errors.links?.[index]?.platform && (
          <p className="text-red">{errors.links[index]?.platform?.message}</p>
        )}
      </div>
      <div className="text-left">
        <Text as="label" htmlFor="link">
          Link
        </Text>
        <InputField
          name={`links.${index}.link`}
          placeholder="e.g. https://www.github.com/johnappleseed"
          register={register}
          errors={errors}
          id="link"
        />
        {errors.links?.[index]?.link && (
          <p className="text-red">{errors.links[index]?.link?.message}</p>
        )}
      </div>
    </section>
  )
}
