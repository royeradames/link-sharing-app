import dynamic from "next/dynamic"
import { clsx } from "clsx"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
const SlButton = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlButton),
  {
    ssr: false,
  }
)

export type TPreviewList = {
  options: { background: string; label: string; iconName: string }
}
export function PreviewListButton({ options }: TPreviewList) {
  return (
    <SlButton
      className={clsx(
        "[&::part(base)]:w-52 [&::part(base)]:rounded-lg [&::part(base)]:justify-start [&::part(prefix)]:flex-grow-0 [&::part(label)]:flex-grow-0 [&::part(suffix)]:flex-1 [&::part(suffix)]:justify-start [&::part(suffix)]:flex-row-reverse",
        {
          [options.background]: options.background,
        }
      )}
      size="large"
    >
      <SlIcon
        name={options.iconName}
        className="text-white"
        slot="prefix"
      ></SlIcon>
      <span className="text-white">{options.label}</span>
      <SlIcon name="arrow-right" className="text-white" slot="suffix" />
    </SlButton>
  )
}
