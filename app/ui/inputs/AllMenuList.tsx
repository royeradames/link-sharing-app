import { Select, TDropDown } from "@/app/ui/inputs/Select"
import { SlChangeEvent } from "@shoelace-style/shoelace"
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
  onChange: (value: string) => void
  register: UseFormRegister<any>
  name: string
}
export function AllMenuList(props: TAllMenuList) {
  const { onChange } = props
  function handleChange(event: SlChangeEvent) {
    const target = event.target as HTMLSelectElement
    onChange(target.value)
  }
  return (
    <Select
      name={props.name}
      register={props.register}
      options={options}
      onChange={handleChange}
    ></Select>
  )
}
