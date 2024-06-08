import { CustomizeLinks } from "@/app/links/components/CustomizeLinks"
import { LinksFormProvider } from "@/app/links/components/LinksFormProvider"
// import { FormProvider } from "react-hook-form"
// import { FormProvider } from "@/app/links/FormProvider"

export default function Page() {
  return (
    <LinksFormProvider>
      <CustomizeLinks />
    </LinksFormProvider>
  )
}
