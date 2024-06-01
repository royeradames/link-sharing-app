"use client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { InputField, TextFieldSchema } from "@/app/ui/InputField"
import Text from "@/app/ui/Text"
import { Button } from "@/app/ui/Button"

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
  return (
    <form
      className="w-full p-4 flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Text
        as="label"
        htmlFor="textField"
        className="text-xl font-semibold mb-4"
      >
        Text Field
      </Text>
      <InputField
        register={register}
        errors={errors}
        name="textField"
        placeholder="Text Field"
        id="textField"
      />
      <div>
        <Button>Post question</Button>
      </div>
    </form>
  )
}
