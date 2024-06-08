"use client"

import React, { createContext, ReactNode, useContext } from "react"
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const LinksSchema = z.object({
  links: z.array(
    z.object({
      platform: z.string(),
      link: z.string().url(),
    })
  ),
})

type LinksSchemaType = z.infer<typeof LinksSchema>

interface FormContextType extends UseFormReturn<LinksSchemaType> {
  fields: ReturnType<typeof useFieldArray>["fields"]
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}

export const FormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const methods = useForm<LinksSchemaType>({
    resolver: zodResolver(LinksSchema),
    defaultValues: {
      links: [],
    },
  })

  const { fields } = useFieldArray({
    control: methods.control,
    name: "links",
  })

  return (
    <FormContext.Provider value={{ ...methods, fields }}>
      {children}
    </FormContext.Provider>
  )
}
