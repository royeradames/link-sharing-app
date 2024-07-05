"use client"
import Link from "next/link"
import { clsx } from "clsx"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import React from "react"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
export default function Nav({}: {}) {
  const pathname = usePathname()
  const linkStyles = (isActive: boolean) => {
    return clsx(
      "flex gap-2 items-center text-base text-grey font-semibold hover:text-purple py-2.5 px-7 hover: rounded-lg",
      {
        "bg-light-purple text-purple": isActive,
      }
    )
  }
  const iconSizeStyles = "h-5 w-5"
  return (
    <nav className="flex ">
      <Link href="/links" className={linkStyles(pathname.includes("/links"))}>
        <SlIcon name="link-45deg" className={iconSizeStyles} />
        <span className="hidden sm:inline">Links</span>
      </Link>
      <Link
        href="/profile-details"
        className={linkStyles(pathname.includes("/profile-details"))}
      >
        <SlIcon name="user-circle" className={iconSizeStyles} />
        <span className="hidden sm:inline">Profile Details</span>
      </Link>
    </nav>
  )
}
