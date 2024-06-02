import React from "react"
import clsx from "clsx"
import { z } from "zod"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import Text from "@/app/ui/components/Text"
import dynamic from "next/dynamic"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
export const TextFieldSchema = z
  .string()
  .min(1, { message: "Please check again" })

export type TextFieldProps = {
  iconName?: string
  name: string
  placeholder: string
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  id: string
}

export const InputField = ({
  register,
  errors,
  name,
  id,
  iconName = "link-45deg",
  placeholder,
}: TextFieldProps) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-2  rounded-lg py-2.5 px-4 text-base font-semibold  focus-within:outline-none focus-within:ring-2 ring-offset-2 border  hover:cursor-pointer hover:shadow hover:shadow-purple/25 hover:border-purple ",
        {
          "border-gray-300 text-black hover:caret-purple focus-within:border-purple focus-within:ring-purple":
            !errors[name]?.message,
          "border-red text-red hover:caret-red focus-within:border-red focus-within:ring-red":
            errors[name]?.message,
        }
      )}
    >
      <SlIcon name={iconName} aria-hidden className="h-5 w-5 text-grey" />

      <input
        className={clsx(
          "font-normal flex-1 bg-transparent focus:outline-none font-regular leading-[150%] text-base placeholder:font-regular placeholder:leading-[150%] placeholder:text-base placeholder:opacity-50 placeholder-dark-grey placeholder:font-normal"
        )}
        placeholder={placeholder}
        {...register(name)}
        aria-describedby="errorsId"
        id={id}
      />

      <div>
        {errors[name]?.message && (
          <Text
            id="errorsId"
            aria-hidden="true"
            size="small"
            className="text-red w-max"
            as="p"
          >
            <span className="sr-only">Error</span>
            <span>{` ${errors[name]?.message}`}</span>
          </Text>
        )}
      </div>
    </div>
  )
}
