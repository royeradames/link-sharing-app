import { CustomizeLinks } from "@/app/links/components/CustomizeLinks"
import { LinksFormProvider } from "@/app/links/LinksFormProvider"
import { LivePreview } from "@/app/ui/components/LivePreview"

export default function Page() {
  return (
    <LinksFormProvider>
      <article
        aria-label="Customize your links"
        className="flex flex-wrap gap-6 justify-center"
      >
        <LivePreview />
        <CustomizeLinks />
      </article>
    </LinksFormProvider>
  )
}
