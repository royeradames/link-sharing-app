import React from "react"
import { Link2Icon } from "@radix-ui/react-icons"
import clsx from "clsx"
import { z } from "zod"
import { FieldErrors, UseFormRegister } from "react-hook-form"
import Body from "@/app/ui/Body"

export const TextFieldSchema = z
  .string()
  .min(1, { message: "Please check again" })

export type TextFieldProps = {
  name: string
  placeholder: string
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

export const InputField = ({
  register,
  errors,
  name,
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
      <Link2Icon aria-hidden className="h-5 w-5 text-grey" />

      <input
        className={clsx(
          "flex-1 bg-transparent focus:outline-none font-regular leading-[150%] text-base placeholder:font-regular placeholder:leading-[150%] placeholder:text-base",
          {
            "placeholder-gray-500": !errors[name]?.message,
            "placeholder-red": errors[name]?.message,
          }
        )}
        placeholder={placeholder}
        {...register(name)}
      />

      <div aria-live="polite">
        {errors[name]?.message && (
          <Body size="small" className="text-red w-max">
            <span className="sr-only">Error</span>
            <span>{` ${errors[name]?.message}`}</span>
          </Body>
        )}
      </div>
    </div>
  )
}
