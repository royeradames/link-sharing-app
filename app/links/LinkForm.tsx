import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { AllMenuList } from "@/app/ui/components/AllMenuList"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"
import { DragHandleButton } from "@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button"
import { RefObject } from "react"

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
  name: string
  dragHandleRef: RefObject<HTMLButtonElement>
}) {
  function handlePlatFormChange() {
    //   todo: on click push a
  }

  return (
    <section>
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
      <div>
        <Text as="label" htmlFor="platform">
          Platform
        </Text>
        <AllMenuList onChange={handlePlatFormChange} />
      </div>
    </section>
  )
}
