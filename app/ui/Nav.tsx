"use client"
import Link from "next/link"
import { clsx } from "clsx"
import { AvatarIcon, Link2Icon } from "@radix-ui/react-icons"
import { usePathname } from "next/navigation"

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
        <Link2Icon className={iconSizeStyles} />
        Links
      </Link>
      <Link
        href="/profile-details"
        className={linkStyles(pathname.includes("/profile-details"))}
      >
        <AvatarIcon className={iconSizeStyles} /> Profile Details
      </Link>
    </nav>
  )
}
