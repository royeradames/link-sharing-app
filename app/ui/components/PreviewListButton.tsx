import dynamic from "next/dynamic"
import { clsx } from "clsx"
import Link from "next/link"

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
export function PreviewList({
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
