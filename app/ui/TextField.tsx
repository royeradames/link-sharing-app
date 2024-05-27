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

export const TextField = ({
  register,
  errors,
  name,
  placeholder,
}: TextFieldProps) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 border rounded-lg py-2.5 px-4 text-base font-semibold  focus-within:border-purple-500 focus-within:outline-none focus-within:ring-2 ",
        {
          "border-gray-300 text-black focus-within:ring-purple-500  ":
            !errors[name]?.message,
          "border-red text-red focus-within:ring-red ": errors[name]?.message,
        }
      )}
    >
      <Link2Icon className="h-5 w-5 text-grey" />

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

      {errors[name]?.message && (
        <Body
          size="small"
          className="text-red w-max"
        >{`${errors[name]?.message}`}</Body>
      )}
    </div>
  )
}
