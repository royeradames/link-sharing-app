import { Header } from "@/app/ui/components/Header"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="p-4 bg-light-grey flex flex-col gap-4">
      <Header />
      {children}
    </main>
  )
}
