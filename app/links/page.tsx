import { CustomizeLinks } from "@/app/links/components/CustomizeLinks"
import { LinksFormProvider } from "@/app/links/components/LinksFormProvider"

export default function Page() {
  return (
    <LinksFormProvider>
      <CustomizeLinks />
    </LinksFormProvider>
  )
}
