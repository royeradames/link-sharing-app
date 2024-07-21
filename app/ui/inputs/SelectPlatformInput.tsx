"use client"
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { StyleableOption } from "@/app/ui/inputs/StyleableOption"
import StyleableSelectBrows from "@/app/ui/inputs/StyleableSelect"
import { PlatformOptions } from "@/app/ui/inputs/PlatformOptions"

export type TAllMenuList = {
  name: string
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
}
export function SelectPlatformInput(props: TAllMenuList) {
  return (
    <StyleableSelectBrows
      placeholder="Select a platform"
      register={props.register}
      setValue={props.setValue}
      watch={props.watch}
      name={props.name}
    >
      {PlatformOptions.map(option => (
        <StyleableOption
          key={option.value}
          value={option.value}
          triggerLabel={option.label}
          className="group flex gap-3 items-center p-2 cursor-pointer text-dark-grey hover:bg-gray-100 data-[selected]:text-purple data-[focused]:text-purple"
        >
          {option.Icon}
          <span>{option.label}</span>
          <span className="hidden group-data-[selected]:inline">
            (Selected)
          </span>
        </StyleableOption>
      ))}
    </StyleableSelectBrows>
  )
}
