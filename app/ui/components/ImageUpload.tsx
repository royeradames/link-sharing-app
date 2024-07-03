"use client"
import dynamic from "next/dynamic"
import { ChangeEvent, useRef, useState } from "react"
import { clsx } from "clsx"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)

export function ImageUpload({
  id,
  name,
  description,
}: {
  id: string
  name: string
  description?: string
}) {
  const [isImageUpload, setIsImageUpload] = useState(false)
  const [imgUrl, setImgUrl] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleImage(input: ChangeEvent<HTMLInputElement>) {
    const file = input.target.files?.[0]
    if (!file) {
      setIsImageUpload(false)
      setImgUrl("")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImgUrl(reader.result as string)
      setIsImageUpload(true)
    }
    reader.readAsDataURL(file)
  }
  function openInput() {
    inputRef.current?.click()
  }
  return (
    <div
      className="flex flex-col items-center gap-8 self-stretch cursor-pointer sm:flex-row"
      tabIndex={0}
      onKeyDown={key => {
        const keysThatActivateAInput =
          key.code === "Space" || key.code === "Enter"
        if (!keysThatActivateAInput) {
          return
        }
        key.preventDefault()
        openInput()
      }}
      onClick={openInput}
    >
      <div
        className={clsx(
          "flex flex-col justify-center items-center bg-light-purple rounded-xl pl-[39px] pr-[38px] pt-[61px] pb-[60px]",
          {
            "text-white bg-dark-grey/25": isImageUpload,
          }
        )}
        style={{
          backgroundImage: imgUrl ? `url(${imgUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <SlIcon
          aria-hidden={true}
          name="card-image"
          className={clsx("w-10 h-10 mb-2 text-purple", {
            "text-white": isImageUpload,
          })}
        />
        <span
          className={clsx(
            "text-purple text-base font-semibold leading-[150%]",
            {
              "text-white": isImageUpload,
            }
          )}
        >
          {isImageUpload ? "Change Image" : "+ Upload Image"}
        </span>
        <input
          ref={inputRef}
          aria-hidden={true}
          className="opacity-0 h-1 w-1"
          type="file"
          id={id}
          name={name}
          accept=".jpg, .jpeg, .png"
          onChange={handleImage}
          tabIndex={-1}
        ></input>
      </div>
      {description && (
        <p className="text-dark-grey text-base font-normal leading-[150%]">
          {description}
        </p>
      )}
    </div>
  )
}
