"use client"
import {
  SlOption,
  SlSelect,
} from "@/node_modules/@shoelace-style/shoelace/cdn/react"
import { Link2Icon } from "@radix-ui/react-icons"

export type TDropDown2 = {
  options: { value: string; label: string }[]
  value?: string
  onChange: (event: any) => void
}
export function Dropdown2(props: TDropDown2) {
  const { options, value = "", onChange } = props
  // incorrect css doesn't load with part-[]
  // you are not notify in any way

  /*
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
   */
  return (
    <SlSelect
      placeholder={value}
      onSlChange={onChange}
      className="
        w-full
        part-[combobox]:hover:shadow
        part-[combobox]:hover:shadow-purple/25
        part-[combobox]:hover:border-purple
        part-[combobox]:open:shadow
        part-[combobox]:open:shadow-purple/25
        part-[combobox]:open:border-purple
        part-[expand-icon]:text-purple
      "
    >
      <div slot="prefix">
        <Link2Icon aria-hidden className="h-5 w-5 text-grey" />
      </div>

      {options.map((option, i: number) => (
        <SlOption
          key={i}
          value={option.value}
          className="part-[checked-icon]:hidden part-[base]:[--sl-color-primary-600:none] part-[base]:[--sl-color-neutral-0:var(--dark-grey)] aria-selected:part-[base]:[--sl-color-neutral-0:var(--purple)]"
        >
          {option.label}
        </SlOption>
      ))}
    </SlSelect>
  )
}
