"use client"
import Link from "next/link"
import { clsx } from "clsx"
import { usePathname } from "next/navigation"
import React from "react"
import { SlIcon } from "@/shoelace-wrappers"

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
      <Link
        href="/dashboard/links"
        className={linkStyles(pathname.includes("/links"))}
      >
        <SlIcon name="link-45deg" className={iconSizeStyles} />
        <span className="hidden sm:inline">Links</span>
      </Link>
      <Link
        href="/dashboard/profile-details"
        className={linkStyles(pathname.includes("/profile-details"))}
      >
        <SlIcon name="user-circle" className={iconSizeStyles} />
        <span className="hidden sm:inline">Profile Details</span>
      </Link>
    </nav>
  )
}
