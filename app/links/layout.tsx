import { Header } from "@/app/ui/components/Header"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="m-4 bg-light-grey">
      <Header />
      {children}
    </main>
  )
}
