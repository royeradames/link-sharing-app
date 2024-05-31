"use client"
import Heading from "@/app/ui/Heading"
import Text from "@/app/ui/Text"
import Button from "@/app/ui/Button"
import Nav from "@/app/ui/Nav"
import { FormDemo } from "@/app/ui/FormDemo"
import { Dropdown } from "@/app/ui/Dropdown"
import React, { useState } from "react"

export default function Home() {
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
    <main className="flex min-h-screen flex-col gap-8 items-center p-24">
      <Dropdown
        options={options}
        value="Dropdown Field Active"
        onChange={handleSelectChange}
      />
      <FormDemo />
      <Heading as="h1">Royer Adames</Heading>
      <Heading as="h1" size="small">
        Royer Adames
      </Heading>
      <Text>Body Medium Royer Adames</Text>
      <Text size="small">Body small Royer Adames</Text>
      <Button>Primary Button</Button>
      <Button disabled>Primary disable Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="secondary" disabled>
        Secondary disable Button
      </Button>
      <Nav></Nav>
      <Nav></Nav>
    </main>
  )
}
