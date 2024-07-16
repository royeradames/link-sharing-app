"use client"
import DropdownDemo from "@/app/ui/demos/DropdownDemo"
import IconDemo from "@/app/ui/demos/IconDemo"
import { SlImportDemo } from "@/app/ui/demos/SlImportDemo"
import { FormDemo } from "@/app/ui/demos/FormDemo"
import { Button } from "@/app/ui/inputs/Button"
import { PreviewListDemo } from "@/app/ui/demos/PreviewListDemo"
import { SlTab, SlTabGroup, SlTabPanel } from "@/shoelace-wrappers"

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
        {/*<AllMenuList onChange={handleMenuListChange} />*/}
      </SlTabPanel>
      <SlTabPanel name="ImageUpload">{/*<ImageUpload1 />*/}</SlTabPanel>
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
