"use client"
import React, { useState } from "react"
import * as Form from "@radix-ui/react-form"
import { Link2Icon } from "@radix-ui/react-icons"
import clsx from "clsx"
import { z } from "zod"
import Button from "@/app/ui/Button"
import { Control } from "react-hook-form"

// Define a single schema for the text field
const textFieldSchema = z.string().min(1, "Text Field is required")

type FormState = {
  textField: string
}

type TextFieldProps = {
  name: string
  control: Control<any>
  value: string
  placeholder: string
  state: "empty" | "filled" | "active" | "error"
  message?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus: () => void
  onBlur: () => void
}

const TextField = ({
  name,
  value,
  placeholder,
  state,
  message,
  onChange,
  onFocus,
  onBlur,
}: TextFieldProps) => {
  const inputClass = clsx(
    "flex items-center gap-2 border rounded-lg py-2.5 px-4 text-base font-semibold",
    {
      "border-gray-300 text-gray-500": state === "empty",
      "border-gray-300 text-black": state === "filled",
      "border-purple-500 text-black outline-none ring-2 ring-purple-500":
        state === "active",
      "border-red-500 text-red-500": state === "error",
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
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </Form.Control>
      {state === "error" && message && (
        <Form.Message className="text-red-500 mt-1 text-sm">
          {message}
        </Form.Message>
      )}
    </Form.Field>
  )
}

const FormDemo = () => {
  const [formState, setFormState] = useState<FormState>({ textField: "" })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [focus, setFocus] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
    setErrors({})
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const result = textFieldSchema.safeParse(formState)
    if (!result.success) {
      const formattedErrors = result.error.format()
      const newErrors: { [key: string]: string } = {}
      for (const [key, value] of Object.entries(formattedErrors)) {
        newErrors[key] = value.join(", ")
      }
      setErrors(newErrors)
    } else {
      console.log("Form submitted successfully:", formState)
      setErrors({})
    }
  }

  const determineState = () => {
    if (errors.textField) {
      return "error"
    } else if (focus) {
      return "active"
    } else if (formState.textField) {
      return "filled"
    } else {
      return "empty"
    }
  }

  return (
    <Form.Root className="w-[300px] p-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Text Field</h2>
      <TextField
        name="textField"
        value={formState.textField}
        placeholder="Text Field"
        state={determineState()}
        message={errors.textField}
        onChange={handleChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      <Form.Submit asChild>
        <Button>Post question</Button>
      </Form.Submit>
    </Form.Root>
  )
}

export default FormDemo
