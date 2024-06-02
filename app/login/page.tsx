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
import Link from "next/link"

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Must be a valid email" })
    .min(1, { message: "Can’t be empty" }),
  password: z.string().min(1, { message: "Please check again" }),
})
export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const onSubmit = async (value: unknown) => {
    console.log("value")
    console.log(value)
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  return (
    <div className="flex justify-center items-center bg-light-grey h-screen w-screen">
      <div className="flex flex-col items-center gap-[51px]">
        <Logo />
        <section className="flex flex-col items-start gap-10 self-stretch p-10 bg-white w-[482px]">
          <header className="flex flex-col gap-2">
            <Heading as="h1">Login</Heading>
            <Text as="p">Add your details below to get back into the app</Text>
          </header>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 w-full"
          >
            <div>
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
            </div>
            <div>
              <Text as="label" htmlFor="email">
                Password
              </Text>
              <InputField
                name="password"
                iconName="lock"
                placeholder="Enter your password"
                register={register}
                errors={errors}
                id="password"
              />
            </div>
            <Button type="submit" loading={isSubmitting}>
              Login
            </Button>
            <Text as="p" className="text-center">
              Don’t have an account?{" "}
              <Link className="text-purple " href="/create-account">
                Create account
              </Link>
            </Text>
          </form>
        </section>
      </div>
    </div>
  )
}
