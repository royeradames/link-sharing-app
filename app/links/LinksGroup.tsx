"use client"
import { Button } from "@/app/ui/components/Button"
import Image from "next/image"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { LinkForm } from "@/app/links/LinkForm"
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import ReactDOM from "react-dom"
import invariant from "tiny-invariant"
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { token } from "@atlaskit/tokens"
import { useLinksFormContext } from "@/app/links/LinksFormProvider"

type CleanupFn = () => void

type ItemEntry = { itemId: string; element: HTMLElement }

type ListContextValue = {
  getListLength: () => number
  registerItem: (entry: ItemEntry) => CleanupFn
  reorderItem: (args: {
    startIndex: number
    indexOfTarget: number
    closestEdgeOfTarget: Edge | null
  }) => void
  instanceId: symbol
}

const ListContext = createContext<ListContextValue | null>(null)

function useListContext() {
  const listContext = useContext(ListContext)
  invariant(listContext !== null)
  return listContext
}

type LinkItem = {
  form: typeof LinkForm
  id: string | number
}

const itemKey = Symbol("item")
type ItemData = {
  [itemKey]: true
  item: LinkItem
  index: number
  instanceId: symbol
}

function getItemData({
  item,
  index,
  instanceId,
}: {
  item: LinkItem
  index: number
  instanceId: symbol
}): ItemData {
  return {
    [itemKey]: true,
    item,
    index,
    instanceId,
  }
}

function isItemData(data: Record<string | symbol, unknown>): data is ItemData {
  return data[itemKey] === true
}

type DraggableState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "dragging" }

const idleState: DraggableState = { type: "idle" }
const draggingState: DraggableState = { type: "dragging" }

const listItemStyles = "relative p-4"
const listItemDisabledStyles = "opacity-40"
const listItemPreviewStyles =
  "py-1 px-4 rounded-lg bg-gray-100 max-w-[360px] whitespace-nowrap overflow-hidden text-ellipsis"

function getItemRegistry() {
  const registry = new Map<string, HTMLElement>()

  function register({ itemId, element }: ItemEntry) {
    registry.set(itemId, element)

    return function unregister() {
      registry.delete(itemId)
    }
  }

  function getElement(itemId: string): HTMLElement | null {
    return registry.get(itemId) ?? null
  }

  return { register, getElement }
}

function ListItem({
  item,
  index,
  handleRemove,
}: {
  item: LinkItem
  index: number
  handleRemove: (id: string | number) => void
}) {
  const { registerItem, instanceId } = useListContext()

  const ref = useRef<HTMLDivElement>(null)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)

  const dragHandleRef = useRef<HTMLButtonElement>(null)

  const [draggableState, setDraggableState] =
    useState<DraggableState>(idleState)

  useEffect(() => {
    const element = ref.current
    const dragHandle = dragHandleRef.current
    invariant(element)
    invariant(dragHandle)

    const data = getItemData({ item, index, instanceId })

    return combine(
      registerItem({ itemId: item.id.toString(), element }),
      draggable({
        element: dragHandle,
        getInitialData: () => data,
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: token("space.200", "16px"),
              y: token("space.100", "8px"),
            }),
            render({ container }) {
              setDraggableState({ type: "preview", container })

              return () => setDraggableState(draggingState)
            },
          })
        },
        onDragStart() {
          setDraggableState(draggingState)
        },
        onDrop() {
          setDraggableState(idleState)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return (
            isItemData(source.data) && source.data.instanceId === instanceId
          )
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          })
        },
        onDrag({ self, source }) {
          const isSource = source.element === element
          if (isSource) {
            setClosestEdge(null)
            return
          }

          const closestEdge = extractClosestEdge(self.data)

          const sourceIndex = source.data.index
          invariant(typeof sourceIndex === "number")

          const isItemBeforeSource = index === sourceIndex - 1
          const isItemAfterSource = index === sourceIndex + 1

          const isDropIndicatorHidden =
            (isItemBeforeSource && closestEdge === "bottom") ||
            (isItemAfterSource && closestEdge === "top")

          if (isDropIndicatorHidden) {
            setClosestEdge(null)
            return
          }

          setClosestEdge(closestEdge)
        },
        onDragLeave() {
          setClosestEdge(null)
        },
        onDrop() {
          setClosestEdge(null)
        },
      })
    )
  }, [instanceId, item, index, registerItem])

  const LinkFormFomArray = item.form
  return (
    <Fragment>
      <div
        ref={ref}
        className={`${listItemStyles} ${draggableState.type === "dragging" ? listItemDisabledStyles : ""}`}
      >
        <LinkFormFomArray
          index={index}
          onRemove={() => handleRemove(item.id)}
          edge={closestEdge}
          dragHandleRef={dragHandleRef}
        />
      </div>
      {draggableState.type === "preview" &&
        ReactDOM.createPortal(
          <div className={listItemPreviewStyles}>{item.form.name}</div>,
          draggableState.container
        )}
    </Fragment>
  )
}

export function LinksGroup() {
  const { fields, append, remove, move } = useLinksFormContext()

  const handleAddNewLink = () => {
    append({
      platform: "",
      link: "",
    })
  }

  const reorderItem = useCallback(
    ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      startIndex: number
      indexOfTarget: number
      closestEdgeOfTarget: Edge | null
    }) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: "vertical",
      })

      if (finishIndex === startIndex) {
        return
      }

      move(startIndex, finishIndex)
    },
    [move]
  )

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data)
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target) {
          return
        }

        const sourceData = source.data
        const targetData = target.data
        if (!isItemData(sourceData) || !isItemData(targetData)) {
          return
        }

        const indexOfTarget = fields.findIndex(
          item => item.id === targetData.item.id
        )
        if (indexOfTarget < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)

        reorderItem({
          startIndex: sourceData.index,
          indexOfTarget,
          closestEdgeOfTarget,
        })
      },
    })
  }, [fields, reorderItem])

  const getListLength = useCallback(() => fields.length, [fields.length])

  const contextValue: ListContextValue = useMemo(() => {
    return {
      registerItem: getItemRegistry().register,
      reorderItem,
      instanceId: Symbol("instance-id"),
      getListLength,
    }
  }, [reorderItem, getListLength])

  return (
    <ListContext.Provider value={contextValue}>
      <Button variant="secondary" onClick={handleAddNewLink}>
        + Add new link
      </Button>
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
      {!!fields.length && (
        <div className="flex flex-col gap-2">
          {fields.map((item, index) => (
            <ListItem
              key={item.id}
              item={{ form: LinkForm, id: item.id }}
              index={index}
              handleRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
    </ListContext.Provider>
  )
}
