import { CustomizeLinks } from "@/app/links/CustomizeLinks"
import { FormProvider } from "@/app/links/FormProvider"
// import { FormProvider } from "react-hook-form"
// import { FormProvider } from "@/app/links/FormProvider"

export default function Page() {
  return (
    <FormProvider>
      <CustomizeLinks />
    </FormProvider>
  )
}
