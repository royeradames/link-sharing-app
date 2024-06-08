import { CustomizeLinks } from "@/app/links/CustomizeLinks"
import { LinksFormProvider } from "@/app/links/LinksFormProvider"
// import { FormProvider } from "react-hook-form"
// import { FormProvider } from "@/app/links/FormProvider"

export default function Page() {
  return (
    <LinksFormProvider>
      <CustomizeLinks />
    </LinksFormProvider>
  )
}
