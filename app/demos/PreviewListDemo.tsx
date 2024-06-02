import {
  PreviewList,
  TPreviewList,
} from "@/app/ui/components/PreviewListButton"
import React from "react"

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
export function PreviewListDemo() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {optionsLink.map((option, key) => (
        <PreviewList href="#" key={key} options={option} />
      ))}
    </div>
  )
}
