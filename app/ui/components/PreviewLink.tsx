import dynamic from "next/dynamic"
import { clsx } from "clsx"
import Link from "next/link"

const optionsLink: TPreviewList["options"][] = [
  {
    styles: { base: "bg-[#1A1A1A]" },
    label: "Github",
    iconName: "github",
  },
  {
    styles: {
      base: "border-[#D9D9D9] border bg-white",
      text: "text-black",
      icon: "text-grey",
    },
    label: "Frontend Mentor",
    iconName: "frontendmentor",
  },
  {
    styles: { base: "bg-[#1A1A1A] border" },
    label: "Twitter-X",
    iconName: "twitter-x",
  },
  {
    styles: { base: "bg-[#2D68FF]" },
    label: "LinkedIn",
    iconName: "linkedin",
  },
  {
    styles: { base: "bg-[#EE3939]" },
    label: "YouTube",
    iconName: "youtube",
  },
  {
    styles: { base: "bg-[#2442AC]" },
    label: "Facebook",
    iconName: "facebook",
  },
  {
    styles: { base: "bg-[#EE3FC8]" },
    label: "Twitch",
    iconName: "twitch",
  },
  {
    styles: { base: "bg-[#333]" },
    label: "Dev.to",
    iconName: "dev-to",
  },
  {
    styles: { base: "bg-[#8A1A50]" },
    label: "Codewars",
    iconName: "codewars",
  },
  {
    styles: { base: "bg-[#302267]" },
    label: "freeCodeCamp",
    iconName: "freecodecamp",
  },
  {
    styles: { base: "bg-[#EB4925]" },
    label: "GitLab",
    iconName: "gitlab",
  },
  {
    styles: { base: "bg-[#0330D1]" },
    label: "Hashnode",
    iconName: "hashnode",
  },
  {
    styles: { base: "bg-[#EC7100]" },
    label: "Stack Overflow",
    iconName: "stackoverflow",
  },
]
const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)

export type TPreviewList = {
  options: {
    styles: { base: string; icon?: string; logo?: string; text?: string }
    label: string
    iconName: string
  }
  href: string
}
export function PreviewLink({
  options: { styles, label, iconName },
  href,
}: TPreviewList) {
  return (
    <Link
      id="base"
      href={href}
      className={clsx("flex gap-3 p-4 items-center rounded-lg", {
        [styles.base]: styles.base,
      })}
    >
      <SlIcon
        id="logo"
        name={iconName}
        className={clsx("text-white flex-grow-0", {
          [styles.logo || ""]: styles.logo,
        })}
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
