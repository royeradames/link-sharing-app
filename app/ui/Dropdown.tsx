"use client"

import {
  SlIcon,
  SlOption,
  SlSelect,
} from "@/node_modules/@shoelace-style/shoelace/cdn/react"
import styles from "./dropdown.module.css"
import { Link2Icon } from "@radix-ui/react-icons"
import React from "react"

export type TDropDown2 = {
  options: { value: string; label: string }[]
  value?: string
  onChange: (event: any) => void
}
export function Dropdown2({ options, value = "", onChange }: TDropDown2) {
  //verify hard to add the (select) text
  // verify hard to modify with tailwind
  // icons component is not working. Feels half cook.

  //part-[checked-icon]:hidden
  // option--selected
  /*
  className="part-[base]:[--sl-color-primary-600:none] part-[base]:[--sl-color-neutral-0:var(--purple)]  "


   */
  let changedInput = ""
  function prefix(optionValue: string) {
    console.log("optionValue")
    console.log(optionValue)
    console.log("changedInput")
    console.log(changedInput)
    console.log(
      value === optionValue || changedInput === optionValue
        ? "(selected)"
        : "Nothing here"
    )
    return value === optionValue || changedInput === optionValue
      ? "(selected)"
      : "Nothing here"
  }
  return (
    <SlSelect
      placeholder={value}
      onSlChange={onChange}
      onSlInput={(value: any) => {
        console.log("onSlInput")
        console.log(value.target?.value)
        changedInput = value.target?.value
        console.log()
      }}
    >
      <div slot="prefix">
        <Link2Icon aria-hidden className="h-5 w-5 text-grey" />
      </div>

      {options.map((option, i: number) => (
        <SlOption
          key={i}
          value={option.value}
          className={`${styles.optionBase}${styles["option--selected"]}`}
        >
          <SlIcon
            slot="suffix"
            name="patch-check"
            className="option__check"
            library=""
            aria-hidden="true"
          ></SlIcon>
          {/*<SlIcon*/}
          {/*  slot="suffix"*/}
          {/*  name="patch-check"*/}
          {/*  className="text-white"*/}
          {/*></SlIcon>*/}
          {/*<SlIcon name="check"></SlIcon>*/}
          {/*<SlIcon name="archive"></SlIcon>*/}
          {/*<div slot="suffix"></div>*/}
          {/*<div part="checked-icon"></div>*/}
          <SlIcon
            className="option__check"
            name="check"
            library="system"
            aria-hidden="true"
          ></SlIcon>
          <SlIcon
            slot="suffix"
            name="check"
            library="system"
            aria-hidden="true"
          ></SlIcon>
          {option.label} {prefix(option.value)}
        </SlOption>
      ))}
    </SlSelect>
  )
}

//
// export function Dropdown2({ options, value, onChange }: any) {
//   return (
//     <div className="relative w-64">
//       <select
//         value={value}
//         onChange={onChange}
//         className="block w-full px-4 py-2 pr-8 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:cursor-pointer hover:shadow hover:shadow-purple-500/25 appearance-none"
//       >
//         {options.map((option: any) => (
//           <option
//             key={option.value}
//             value={option.value}
//             className="text-gray-700"
//           >
//             {option.label}
//           </option>
//         ))}
//       </select>
//       <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
//         <svg
//           className="w-4 h-4 text-gray-400"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M19 9l-7 7-7-7"
//           ></path>
//         </svg>
//       </div>
//     </div>
//   )
// }
