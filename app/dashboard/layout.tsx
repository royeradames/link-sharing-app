import { Header } from "@/app/ui/components/Header"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="p-4 bg-light-grey min-h-screen">
      <Header />
      {children}
    </main>
  )
}
