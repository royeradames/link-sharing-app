"use client"
import DropdownDemo from "@/app/demos/DropdownDemo"
import IconDemo from "@/app/demos/IconDemo"
import { SlImportDemo } from "@/app/demos/SlImportDemo"
import { FormDemo } from "@/app/demos/FormDemo"
import dynamic from "next/dynamic"
import { Button } from "@/app/ui/components/Button"
import { ImageUpload } from "@/app/ui/components/ImageUpload"
import { AllMenuList } from "@/app/ui/components/AllMenuList"
import { PreviewListDemo } from "@/app/demos/PreviewListDemo"

const SlTab = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod["SlTab"]),
  {
    ssr: false,
  }
)
const SlTabGroup = dynamic(
  () =>
    import("@shoelace-style/shoelace/dist/react").then(
      mod => mod["SlTabGroup"]
    ),
  {
    ssr: false,
  }
)
const SlTabPanel = dynamic(
  () =>
    import("@shoelace-style/shoelace/dist/react").then(
      mod => mod["SlTabPanel"]
    ),
  {
    ssr: false,
  }
)

export function DemoGroup() {
  function handleMenuListChange(value: unknown) {
    console.log(value)
  }

  return (
    <SlTabGroup placement="start" className="mt-2">
      <SlTab slot="nav" panel="PreviewListButton">
        PreviewListButton
      </SlTab>
      <SlTab slot="nav" panel="AllMenuList">
        AllMenuList
      </SlTab>
      <SlTab slot="nav" panel="ImageUpload">
        ImageUpload
      </SlTab>
      <SlTab slot="nav" panel="DropdownDemo">
        DropdownDemo
      </SlTab>
      <SlTab slot="nav" panel="IconDemo">
        IconDemo
      </SlTab>
      <SlTab slot="nav" panel="SlImportDemo">
        SlImportDemo
      </SlTab>
      <SlTab slot="nav" panel="FormDemo">
        FormDemo
      </SlTab>
      <SlTab slot="nav" panel="ButtonDemo">
        ButtonDemo
      </SlTab>

      <SlTabPanel name="PreviewList">
        <PreviewListDemo />
      </SlTabPanel>
      <SlTabPanel name="AllMenuList">
        <AllMenuList onChange={handleMenuListChange} />
      </SlTabPanel>
      <SlTabPanel name="ImageUpload">
        <ImageUpload />
      </SlTabPanel>
      <SlTabPanel name="DropdownDemo">
        <DropdownDemo />
      </SlTabPanel>
      <SlTabPanel name="IconDemo">
        <IconDemo />
      </SlTabPanel>
      <SlTabPanel name="SlImportDemo">
        <SlImportDemo />
      </SlTabPanel>
      <SlTabPanel name="FormDemo">
        <FormDemo />
      </SlTabPanel>
      <SlTabPanel name="ButtonDemo">
        <div className="flex flex-col gap-4">
          <Button variant="primary">Button</Button>
          <Button variant="primary">Second Primary Button</Button>
          <Button variant="primary" disabled>
            Button
          </Button>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary" disabled>
            Button
          </Button>
        </div>
      </SlTabPanel>
    </SlTabGroup>
  )
}
