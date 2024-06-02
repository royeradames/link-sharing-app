"use client"
import React from "react"
import { Logo } from "@/app/ui/components/Logo"
import Text from "@/app/ui/components/Text"
import Heading from "@/app/ui/components/Heading"
import { InputField } from "@/app/ui/components/InputField"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/app/ui/components/Button"

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Must be a valid email" })
    .min(1, { message: "Can’t be empty" }),
})
export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })
  const onSubmit = (value: unknown) => {
    console.log("value")
    console.log(value)
  }
  return (
    <div className="flex justify-center items-center">
      <div>
        <Logo />
        <section className="flex flex-col items-start gap-10 self-stretch p-10">
          <header className="flex flex-col gap-2">
            <Heading as="h1">Login</Heading>
            <Text as="p">Add your details below to get back into the app</Text>
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Text as="label" htmlFor="email">
              Email Address
            </Text>
            <InputField
              name="email"
              iconName="email"
              placeholder="e.g. alex@email.com"
              register={register}
              errors={errors}
              id="email"
            />
            <Button type="submit">Login</Button>
          </form>
        </section>
      </div>
    </div>
  )
}
