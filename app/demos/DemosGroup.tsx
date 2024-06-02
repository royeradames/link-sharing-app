import DropdownDemo from "@/app/demos/DropdownDemo"
import IconDemo from "@/app/demos/IconDemo"
import { SlImportDemo } from "@/app/demos/SlImportDemo"
import { FormDemo } from "@/app/demos/FormDemo"
import dynamic from "next/dynamic"
import React from "react"
import { Button } from "@/app/ui/components/Button"
import { ImageUpload } from "@/app/ui/components/ImageUpload"
import { AllMenuList } from "@/app/ui/components/AllMenuList"
import {
  PreviewListButton,
  TPreviewList,
} from "@/app/ui/components/PreviewListButton"

const SlTab = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod["SlTab"]),
  {
    ssr: false,
  }
)
const SlTabGroup = dynamic(
  () =>
    import("@shoelace-style/shoelace/dist/react").then(
      mod => mod["SlTabGroup"]
    ),
  {
    ssr: false,
  }
)
const SlTabPanel = dynamic(
  () =>
    import("@shoelace-style/shoelace/dist/react").then(
      mod => mod["SlTabPanel"]
    ),
  {
    ssr: false,
  }
)

const options: TPreviewList["options"][] = [
  {
    background: "[&::part(base)]:bg-[#1A1A1A]",
    label: "Github",
    iconName: "github",
  },
  {
    background: "[&::part(base)]:bg-[#D9D9D9]",
    label: "Frontend Mentor",
    iconName: "frontend-mentor",
  },
  {
    background: "[&::part(base)]:bg-[#D9D9D9]",
    label: "Twitter-X",
    iconName: "twitter-x",
  },
  {
    background: "[&::part(base)]:bg-[#2D68FF]",
    label: "LinkedIn",
    iconName: "linkedin",
  },
  {
    background: "[&::part(base)]:bg-[#EE3939]",
    label: "YouTube",
    iconName: "youtube",
  },
  {
    background: "[&::part(base)]:bg-[#2442AC]",
    label: "Facebook",
    iconName: "facebook",
  },
  {
    background: "[&::part(base)]:bg-[#EE3FC8]",
    label: "Twitch",
    iconName: "twitch",
  },
  {
    background: "[&::part(base)]:bg-[#333]",
    label: "Dev.to",
    iconName: "dev-to",
  },
  {
    background: "[&::part(base)]:bg-[#8A1A50]",
    label: "Codewars",
    iconName: "codewars",
  },
  {
    background: "[&::part(base)]:bg-[#302267]",
    label: "freeCodeCamp",
    iconName: "freecodecamp",
  },
  {
    background: "[&::part(base)]:bg-[#EB4925]",
    label: "GitLab",
    iconName: "gitlab",
  },
  {
    background: "[&::part(base)]:bg-[#0330D1]",
    label: "Hashnode",
    iconName: "hashnode",
  },
  {
    background: "[&::part(base)]:bg-[#EC7100]",
    label: "Stack Overflow",
    iconName: "stackoverflow",
  },
]
export function DemoGroup() {
  function handleMenuListChange(value: unknown) {
    console.log(value)
  }

  return (
    <SlTabGroup placement="start" className="mt-2">
      <SlTab slot="nav" panel="PreviewListButton">
        PreviewListButton
      </SlTab>
      <SlTab slot="nav" panel="AllMenuList">
        AllMenuList
      </SlTab>
      <SlTab slot="nav" panel="ImageUpload">
        ImageUpload
      </SlTab>
      <SlTab slot="nav" panel="DropdownDemo">
        DropdownDemo
      </SlTab>
      <SlTab slot="nav" panel="IconDemo">
        IconDemo
      </SlTab>
      <SlTab slot="nav" panel="SlImportDemo">
        SlImportDemo
      </SlTab>
      <SlTab slot="nav" panel="FormDemo">
        FormDemo
      </SlTab>
      <SlTab slot="nav" panel="ButtonDemo">
        ButtonDemo
      </SlTab>

      <SlTabPanel name="PreviewList">
        {options.map((option, key) => (
          <PreviewListButton key={key} options={option} />
        ))}
      </SlTabPanel>
      <SlTabPanel name="AllMenuList">
        <AllMenuList onChange={handleMenuListChange} />
      </SlTabPanel>
      <SlTabPanel name="ImageUpload">
        <ImageUpload />
      </SlTabPanel>
      <SlTabPanel name="DropdownDemo">
        <DropdownDemo />
      </SlTabPanel>
      <SlTabPanel name="IconDemo">
        <IconDemo />
      </SlTabPanel>
      <SlTabPanel name="SlImportDemo">
        <SlImportDemo />
      </SlTabPanel>
      <SlTabPanel name="FormDemo">
        <FormDemo />
      </SlTabPanel>
      <SlTabPanel name="ButtonDemo">
        <div className="flex flex-col gap-4">
          <Button variant="primary">Button</Button>
          <Button variant="primary">Second Primary Button</Button>
          <Button variant="primary" disabled>
            Button
          </Button>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary" disabled>
            Button
          </Button>
        </div>
      </SlTabPanel>
    </SlTabGroup>
  )
}
