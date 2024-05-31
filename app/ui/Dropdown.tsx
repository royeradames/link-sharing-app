"use client"
import {
  SlOption,
  SlSelect,
} from "@/node_modules/@shoelace-style/shoelace/cdn/react"
import { GitHubLogoIcon, Link2Icon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formSchema } from "@/app/ui/FormDemo"
import Text from "@/app/ui/Text"
import React from "react"
import { Button } from "@radix-ui/themes"

export type TDropDown = {
  options: { value: string; label: string }[]
  value?: string
  onChange: (event: any) => void
}
export function Dropdown(props: TDropDown) {
  const { options, value = "", onChange } = props

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textField: "",
    },
  })
  function onSubmit(data: unknown) {
    console.log(data)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SlSelect
        {...register("textField")}
        placeholder={value}
        onSlChange={onChange}
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
          <Link2Icon aria-hidden className="h-5 w-5 text-grey" />
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
              <GitHubLogoIcon></GitHubLogoIcon>
            </div>
            {option.label}
            <div slot="suffix" className=" hidden group-aria-selected:inline">
              (selected)
            </div>
          </SlOption>
        ))}
      </SlSelect>
      {errors.textField?.message && (
        <Text
          id="errorsId"
          aria-hidden="true"
          size="small"
          className="text-red w-max"
          as="p"
        >
          <span className="sr-only">Error</span>
          <span>{` ${errors.textField?.message}`}</span>
        </Text>
      )}
      <Button>Submit</Button>
    </form>
  )
}
