import Heading from "@/app/ui/components/Heading"

export function LinkForm({ orderNumber = 0 }: { orderNumber: number }) {
  function handleRemove() {
    alert("remove")
  }

  return (
    <section>
      <header className="flex justify-between items-start self-stretch">
        <Heading
          as="h2"
          className="text-[color:var(--Grey,#737373)] text-base font-bold leading-[150%]"
        >
          <div>=</div> Link #{orderNumber}
        </Heading>
        <button
          className="text-[color-grey text-base font-normal leading-[150%]"
          onClick={handleRemove}
        >
          Remove
        </button>
      </header>
    </section>
  )
}
