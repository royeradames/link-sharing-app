"use client"
import React from "react"
import dynamic from "next/dynamic"
import { UseFormRegister } from "react-hook-form"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
const SlOption = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlOption),
  {
    ssr: false,
  }
)
const SlSelect = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlSelect),
  {
    ssr: false,
  }
)

export type TDropDown = {
  options: { value: string; label: string; iconName?: string }[]
  placeholder?: string
  name: string
  register: UseFormRegister<any>
}
export function Select(props: TDropDown) {
  const { options, placeholder = "" } = props
  return (
    <SlSelect
      placeholder={placeholder}
      {...props.register(props.name)}
      className="
        w-full
        [&::part(combobox)]:hover:shadow
        [&::part(combobox)]:hover:shadow-purple/25
        [&::part(combobox)]:hover:border-purple
        [&::part(combobox)]:open:shadow
        [&::part(combobox)]:open:shadow-purple/25
        [&::part(combobox)]:open:border-purple
        [&::part(combobox)]:focus-within:shadow
        [&::part(combobox)]:focus-within:shadow-purple/25
        [&::part(combobox)]:focus-within:border-purple
        [&::part(expand-icon)]:text-purple
      "
    >
      <div slot="prefix">
        <SlIcon
          name="link-45deg"
          aria-hidden
          className="h-5 w-5 text-grey flex"
        />
      </div>

      {options.map((option, i: number) => (
        <SlOption
          key={i}
          value={option.value}
          className="
            group
            [&::part(prefix)]:flex-none
            [&::part(suffix)]:flex-none
            [&::part(label)]:flex-none
            [&::part(checked-icon)]:hidden
            [&::part(base)]:aria-selected:bg-white
            [&::part(base)]:aria-selected:text-purple
            [&::part(base)]:[--sl-color-neutral-0:var(--purple)]
            [&::part(base)]:[--sl-color-primary-600:white]
            "
        >
          <div slot="prefix">
            <SlIcon name={option.iconName} />
          </div>
          {option.label}
          <div slot="suffix" className=" hidden group-aria-selected:inline">
            (selected)
          </div>
        </SlOption>
      ))}
    </SlSelect>
  )
}
