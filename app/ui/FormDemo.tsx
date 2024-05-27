"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Form from "@radix-ui/react-form"
import Button from "@/app/ui/Button"
import React from "react"
import { TextField, TextFieldSchema } from "@/app/ui/TextField"

export const formSchema = z.object({
  textField: TextFieldSchema,
})
export const FormDemo = () => {
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
    <Form.Root className="w-full p-4" onSubmit={handleSubmit(onSubmit)}>
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
