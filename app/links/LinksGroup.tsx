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
import { v4 } from "uuid"
import ReactDOM from "react-dom"
import invariant from "tiny-invariant"
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { DragHandleButton } from "@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder"
import { Box, Grid, Stack, xcss } from "@atlaskit/primitives"
import { token } from "@atlaskit/tokens"

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

const containerStyles = xcss({
  maxWidth: "400px",
  borderWidth: "border.width",
  borderStyle: "solid",
  borderColor: "color.border",
})

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

type DraggableState =
  | { type: "idle" }
  | { type: "preview"; container: HTMLElement }
  | { type: "dragging" }

const idleState: DraggableState = { type: "idle" }
const draggingState: DraggableState = { type: "dragging" }

const listItemContainerStyles = xcss({
  position: "relative",
  backgroundColor: "elevation.surface",
  borderWidth: "border.width.0",
  borderBottomWidth: token("border.width", "1px"),
  borderStyle: "solid",
  borderColor: "color.border",
  ":last-of-type": {
    borderWidth: "border.width.0",
  },
})

const listItemStyles = xcss({
  position: "relative",
  padding: "space.100",
})

const listItemDisabledStyles = xcss({ opacity: 0.4 })

const listItemPreviewStyles = xcss({
  paddingBlock: "space.050",
  paddingInline: "space.100",
  borderRadius: "border.radius.100",
  backgroundColor: "elevation.surface.overlay",
  maxWidth: "360px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
})

const itemLabelStyles = xcss({
  flexGrow: 1,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
})

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

  const ItemForm = item.form
  return (
    <Fragment>
      <Box ref={ref} xcss={listItemContainerStyles}>
        <Grid
          alignItems="center"
          columnGap="space.050"
          templateColumns="auto 1fr auto"
          xcss={[
            listItemStyles,
            draggableState.type === "dragging" && listItemDisabledStyles,
          ]}
        >
          <DragHandleButton
            ref={dragHandleRef}
            label={`Reorder ${item.form.name}`}
          />
          <Box xcss={itemLabelStyles}>
            <ItemForm
              orderNumber={index + 1}
              onRemove={() => handleRemove(item.id)}
              edge={closestEdge}
            />
          </Box>
        </Grid>
        {/*{closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}*/}
      </Box>
      {draggableState.type === "preview" &&
        ReactDOM.createPortal(
          <Box xcss={listItemPreviewStyles}>{item.form.name}</Box>,
          draggableState.container
        )}
    </Fragment>
  )
}

export function LinksGroup() {
  const [LinkFromGroup, setLinkFromGroup] = useState<LinkItem[]>([])

  const handleAddNewLink = () => {
    setLinkFromGroup(current => [
      ...current,
      {
        form: LinkForm,
        id: v4(),
      },
    ])
  }

  const handleRemove = (id: string | number) => {
    setLinkFromGroup(current => {
      return current.filter(item => item.id !== id)
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

      setLinkFromGroup(listState =>
        reorder({
          list: listState,
          startIndex,
          finishIndex,
        })
      )
    },
    []
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

        const indexOfTarget = LinkFromGroup.findIndex(
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
  }, [LinkFromGroup, reorderItem])

  const getListLength = useCallback(
    () => LinkFromGroup.length,
    [LinkFromGroup.length]
  )

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
      {!!LinkFromGroup.length && (
        <Stack xcss={containerStyles}>
          {LinkFromGroup.map((item, index) => (
            <ListItem
              key={item.id}
              item={item}
              index={index}
              handleRemove={handleRemove}
            />
          ))}
        </Stack>
      )}
    </ListContext.Provider>
  )
}
