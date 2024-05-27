"use client"
import React from "react"
import * as Form from "@radix-ui/react-form"
import { Link2Icon } from "@radix-ui/react-icons"
import clsx from "clsx"
import { z } from "zod"
import Button from "@/app/ui/Button"
import { FieldErrors, useForm, UseFormRegister } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Define a single schema for the text field
export const TextFieldSchema = z.string().min(1, "Text Field is required")

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
    </div>
  )
}

const formSchema = z.object({
  textField: TextFieldSchema,
})
const FormDemo = () => {
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
  const onSubmit = (data: any) => console.log(data)
  console.log(errors.textField?.message)
  return (
    <Form.Root className="w-[300px] p-4" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-xl font-semibold mb-4">Text Field</h2>
      <TextField
        register={register}
        errors={errors}
        name="textField"
        placeholder="Text Field"
      />
      <Form.Submit asChild>
        <Button>Post question</Button>
      </Form.Submit>
    </Form.Root>
  )
}

export default FormDemo
