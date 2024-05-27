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
const TextFieldSchema = z.string().min(1, "Text Field is required")

type TextFieldProps = {
  name: string
  placeholder: string
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

const TextField = ({ register, errors, name, placeholder }: TextFieldProps) => {
  const inputClass = clsx(
    "flex items-center gap-2 border rounded-lg py-2.5 px-4 text-base font-semibold",
    {
      //   "border-gray-300 text-gray-500": control._getWatch() === "empty",
      //   "border-gray-300 text-black": state === "filled",
      //   "border-purple-500 text-black outline-none ring-2 ring-purple-500":
      //     state === "active",
      "border-red-500 text-red-500": errors[name]?.message,
    }
  )

  return (
    <Form.Field className="mb-4" name={name}>
      <Form.Label className="sr-only">{placeholder}</Form.Label>
      <Form.Control asChild>
        <div className={inputClass}>
          <Link2Icon className="h-5 w-5" />
          <input
            className="flex-1 bg-transparent focus:outline-none"
            placeholder={placeholder}
            {...register(name)}
          />
        </div>
      </Form.Control>
      {errors[name]?.message && (
        <Form.Message className="text-red-500 mt-1 text-sm">
          {`${errors[name]?.message}`}
        </Form.Message>
      )}
    </Form.Field>
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
        <Button type="submit">Post question</Button>
      </Form.Submit>
    </Form.Root>
  )
}

export default FormDemo
