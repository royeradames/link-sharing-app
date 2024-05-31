"use client"
import React from "react"
import {
  SlIcon,
  SlTab,
  SlTabGroup,
  SlTabPanel,
} from "@shoelace-style/shoelace/dist/react"
import DropdownDemo from "@/app/demos/DropdownDemo"
import IconDemo from "@/app/demos/IconDemo"
import { SlImportDemo } from "@/app/demos/SlImportDemo"
import { FormDemo } from "@/app/demos/FormDemo"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-8 items-center p-24">
      <SlIcon name="alarm" />

      <SlTabGroup placement="start">
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
      </SlTabGroup>
    </main>
  )
}
