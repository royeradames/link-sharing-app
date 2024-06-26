"use client"
import React, { useState } from "react"
import { Dropdown } from "@/app/ui/components/DropdownOld"

export default function DropdownDemo() {
  const [selectedValue, setSelectedValue] = useState("")

  const handleSelectChange = (event: any) => {
    setSelectedValue(event.target.value)
  }

  const options = [
    { value: "item1", label: "Item 1" },
    { value: "item2", label: "Item 2" },
    { value: "item3", label: "Item 3" },
  ]
  return (
    <Dropdown
      options={options}
      placeholder="DropdownOld Field Active"
      onChange={handleSelectChange}
    />
  )
}
