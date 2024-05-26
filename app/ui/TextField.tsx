"use client"
import React, { useState } from "react"
import * as Form from "@radix-ui/react-form"
import { Link2Icon } from "@radix-ui/react-icons"
import clsx from "clsx"
import { z } from "zod"

const textFieldSchema = z.object({
  textFieldEmpty: z.string().min(1, "Text Field Empty is required"),
  textFieldFilled: z.string().min(1, "Text Field Empty is required"),
  textFieldActive: z.string().min(1, "Text Field Empty is required"),
  textFieldError: z.string().min(1, "Text Field Empty is required"),
})

type TextFieldProps = {
  placeholder: string
  state: "empty" | "filled" | "active" | "error"
  message?: string
}

const TextField = ({ placeholder, state, message }: TextFieldProps) => {
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
    <Form.Field
      className="mb-4"
      name={placeholder.toLowerCase().replace(/ /g, "-")}
    >
      <Form.Label className="sr-only">{placeholder}</Form.Label>
      <Form.Control asChild>
        <div className={inputClass}>
          <Link2Icon className="h-5 w-5" />
          <input
            className="flex-1 bg-transparent focus:outline-none"
            placeholder={placeholder}
            readOnly={state !== "active"}
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
  const [formState, setFormState] = useState({
    textFieldEmpty: "",
    textFieldFilled: "Pre-filled value",
    textFieldActive: "",
    textFieldError: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const result = textFieldSchema.safeParse(formState)
    if (!result.success) {
      const formattedErrors = result.error.format()
      const newErrors: { [key: string]: string } = {}
      for (const [key, value] of Object.entries(formattedErrors)) {
        if (Array.isArray(value)) {
          newErrors[key] = value.join(", ")
        } else if (value && typeof value === "object" && "_errors" in value) {
          newErrors[key] = value._errors.join(", ")
        }
      }
      setErrors(newErrors)
    } else {
      console.log("Form submitted successfully:", formState)
    }
  }

  return (
    <Form.Root className="w-[300px] p-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Text Field</h2>{" "}
      <TextField
        placeholder="Text Field Empty"
        state={errors.textFieldEmpty ? "error" : "empty"}
        message={errors.textFieldEmpty}
      />
      <TextField
        placeholder="Text Field Filled"
        state={errors.textFieldFilled ? "error" : "filled"}
        message={errors.textFieldFilled}
      />
      <TextField
        placeholder="Text Field Active"
        state={errors.textFieldActive ? "error" : "active"}
        message={errors.textFieldActive}
      />
      <TextField
        placeholder="Text Field Error"
        state={errors.textFieldError ? "error" : "error"}
        message={errors.textFieldError}
      />
      <Form.Submit asChild>
        <button className="box-border w-full text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none mt-[10px]">
          Post question
        </button>
      </Form.Submit>
    </Form.Root>
  )
}

export default FormDemo
