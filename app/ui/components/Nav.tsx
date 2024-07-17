"use client"
import Link from "next/link"
import { clsx } from "clsx"
import { usePathname } from "next/navigation"
import React from "react"
import { Link45Deg, UserCircle } from "@/app/ui/svgs"

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
  return (
    <nav className="flex ">
      <Link
        href="/dashboard/links"
        className={linkStyles(pathname.includes("/links"))}
      >
        <Link45Deg height={20} width={20} />
        <span className="hidden sm:inline">Links</span>
      </Link>
      <Link
        href="/dashboard/profile-details"
        className={linkStyles(pathname.includes("/profile-details"))}
      >
        <UserCircle height={20} width={20} />
        <span className="hidden sm:inline">Profile Details</span>
      </Link>
    </nav>
  )
}
