import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { AllMenuList } from "@/app/ui/components/AllMenuList"
import { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box"

export function LinkForm({
  orderNumber = 0,
  onRemove,
  edge,
}: {
  orderNumber: number
  onRemove: () => void
  edge: Edge | null
}) {
  function handlePlatFormChange() {
    //   todo: on click push a
  }

  return (
    <section>
      <header className="flex justify-between items-start self-stretch">
        <Heading
          as="h2"
          className="text-[color:var(--Grey,#737373)] text-base font-bold leading-[150%] flex gap-1 items-center"
        >
          {edge && <DropIndicator edge={edge} gap="1px" />} Link #{orderNumber}
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
