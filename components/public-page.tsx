import Image from "next/image"
import Link from "next/link"

/** The public page frame: brand only, no editor controls. */
export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="public-header">
        <Link href="/" aria-label="Devlinks home" className="brand">
          <Image
            src="/assets/logo/mark.svg"
            width={32}
            height={32}
            alt=""
            priority
          />
          <span className="brand-name">Devlinks</span>
        </Link>
      </header>
      <main id="main" className="public-page">
        {children}
      </main>
    </>
  )
}
