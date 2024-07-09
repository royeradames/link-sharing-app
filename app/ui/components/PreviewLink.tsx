import dynamic from "next/dynamic"
import { clsx } from "clsx"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type PreviewLinkOptions = {
  styles: { base: string; icon?: string; text?: string }
  label: string
  iconName: string
  id: string
}
const optionsLink: PreviewLinkOptions[] = [
  {
    styles: { base: "bg-[#1A1A1A]" },
    label: "Github",
    iconName: "github",
    id: "github",
  },
  {
    styles: {
      base: "border-[#D9D9D9] border bg-white",
      text: "text-black",
      icon: "text-grey",
    },
    label: "Frontend Mentor",
    iconName: "frontend-mentor",
    id: "frontend-mentor",
  },
  {
    styles: { base: "bg-[#1A1A1A] border" },
    label: "Twitter-X",
    iconName: "twitter-x",
    id: "twitter-x",
  },
  {
    styles: { base: "bg-[#2D68FF]" },
    label: "LinkedIn",
    iconName: "linkedin",
    id: "linkedin",
  },
  {
    styles: { base: "bg-[#EE3939]" },
    label: "YouTube",
    iconName: "youtube",
    id: "youtube",
  },
  {
    styles: { base: "bg-[#2442AC]" },
    label: "Facebook",
    iconName: "facebook",
    id: "facebook",
  },
  {
    styles: { base: "bg-[#EE3FC8]" },
    label: "Twitch",
    iconName: "twitch",
    id: "twitch",
  },
  {
    styles: { base: "bg-[#333]" },
    label: "Dev.to",
    iconName: "dev-to",
    id: "dev-to",
  },
  {
    styles: { base: "bg-[#8A1A50]" },
    label: "Codewars",
    iconName: "codewars",
    id: "codewars",
  },
  {
    styles: { base: "bg-[#302267]" },
    label: "freeCodeCamp",
    iconName: "freecodecamp",
    id: "freecodecamp",
  },
  {
    styles: { base: "bg-[#EB4925]" },
    label: "GitLab",
    iconName: "gitlab",
    id: "gitlab",
  },
  {
    styles: { base: "bg-[#0330D1]" },
    label: "Hashnode",
    iconName: "hashnode",
    id: "hashnode",
  },
  {
    styles: { base: "bg-[#EC7100]" },
    label: "Stack Overflow",
    iconName: "stackoverflow",
    id: "stackoverflow",
  },
]
const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)

export type TPreviewList = {
  href: string
  id: string
  className: string
}
export function PreviewLink({ id, href, className }: TPreviewList) {
  const optionLink = optionsLink.find(option => option.id === id)
  if (!optionLink) {
    throw new Error("Couldn't find the link in the available options")
  }
  const { styles, label, iconName } = optionLink
  return (
    <Link
      id="base"
      href={href}
      className={cn(
        clsx("flex gap-3 p-4 items-center rounded-lg", {
          [styles.base]: styles.base,
          [className]: className,
        })
      )}
    >
      <SlIcon
        id="logo"
        name={iconName}
        className={cn(
          clsx("text-white flex-grow-0", {
            [styles.icon || ""]: styles.icon,
          })
        )}
      ></SlIcon>
      <span
        id="text"
        className={clsx(" flex-grow-0", {
          [`${styles.text}`]: styles.text,
          "text-white": !styles.text,
        })}
      >
        {label}
      </span>
      <div className="flex-1 flex justify-start flex-row-reverse">
        <SlIcon
          id="icon"
          name="arrow-right"
          className={clsx("", {
            [styles.icon || ""]: styles.icon,
            "text-white": !styles.icon,
          })}
          slot="suffix"
        />
      </div>
    </Link>
  )
}
