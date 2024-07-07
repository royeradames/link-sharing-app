"use client"
import { Select, TDropDown } from "@/app/ui/inputs/Select"
import { UseFormRegister } from "react-hook-form"

const options: TDropDown["options"] = [
  { value: "github", label: "Github", iconName: "github" },
  {
    value: "frontend-mentor",
    label: "Frontend Mentor",
    iconName: "frontend-mentor",
  },
  {
    value: "twitter-x",
    label: "Twitter-X",
    iconName: "twitter-x",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    iconName: "linkedin",
  },
  {
    value: "youtube",
    label: "YouTube",
    iconName: "youtube",
  },
  {
    value: "facebook",
    label: "Facebook",
    iconName: "facebook",
  },
  {
    value: "twitch",
    label: "Twitch",
    iconName: "twitch",
  },
  {
    value: "dev-to",
    label: "Dev.to",
    iconName: "dev-to",
  },
  {
    value: "codewars",
    label: "Codewars",
    iconName: "codewars",
  },
  {
    value: "freecodecamp",
    label: "freeCodeCamp",
    iconName: "freecodecamp",
  },
  {
    value: "gitlab",
    label: "GitLab",
    iconName: "gitlab",
  },
  {
    value: "hashnode",
    label: "Hashnode",
    iconName: "hashnode",
  },
  {
    value: "stackoverflow",
    label: "Stack Overflow",
    iconName: "stackoverflow",
  },
]

export type TAllMenuList = {
  name: string
  register: UseFormRegister<any>
}
export function SelectPlatformInput(props: TAllMenuList) {
  return (
    <Select
      name={props.name}
      register={props.register}
      options={options}
    ></Select>
  )
}
