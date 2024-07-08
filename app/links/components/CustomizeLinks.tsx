"use client"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { Button } from "@/app/ui/inputs/Button"
import {
  DragableListItem,
  getItemRegistry,
  isItemData,
  ListContext,
  ListContextValue,
} from "@/app/links/components/DragableLinksItem"
import {
  LinksSchemaType,
  useLinksFormContext,
} from "@/app/links/components/LinksFormProvider"
import { useCallback, useEffect, useMemo } from "react"
import {
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { LinkForm } from "@/app/links/components/LinkForm"
import { NoLinkMessage } from "@/app/links/components/NoLinkMessage"

export function CustomizeLinks() {
  const { handleSubmit, fields, append, remove, move, formState } =
    useLinksFormContext()
  const handleAddNewLink = () => {
    append({
      platform: "",
      link: "",
    })
  }

  const onSubmit = (data: LinksSchemaType) => {
    console.log("onSubmit")
    console.log(data)
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" bg-white flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch rounded-lg"
      >
        <div className=" bg-white flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch p-6 text-center">
          <Heading as="h1">Customize your links</Heading>
          <Text as="p">
            Add/edit/remove links below and then share all your profiles with
            the world!
          </Text>
          <Button variant="secondary" onClick={handleAddNewLink}>
            + Add new link
          </Button>

          <NoLinkMessage />
          {!!fields.length && (
            <div className="flex flex-col gap-2">
              {fields.map((item, index) => (
                <DragableListItem
                  key={item.id}
                  item={{ form: LinkForm, id: item.id }}
                  index={index}
                  handleRemove={() => remove(index)}
                />
              ))}
            </div>
          )}
        </div>
        {/**/}

        <Button
          className="p-3 border-t border-borders rounded-b-lg"
          type="submit"
          onClick={() => console.log(formState.errors)}
        >
          Save
        </Button>
      </form>
    </ListContext.Provider>
  )
}
