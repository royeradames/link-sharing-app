"use client"
import dynamic from "next/dynamic"
import { ChangeEvent, useState } from "react"
import { clsx } from "clsx"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
export function ImageUpload() {
  const [isImageUpload, setIsImageUpload] = useState(false)
  const [imgUrl, setImgUrl] = useState("")
  function handleImage(input: ChangeEvent<HTMLInputElement>) {
    const { value } = input.target
    if (!value) {
      setIsImageUpload(false)
      setImgUrl("")
    }
    console.log("value.target.value")
    console.log(value)
    setIsImageUpload(true)
    setImgUrl(value)
  }

  return (
    <section>
      <label
        htmlFor="image_uploads"
        className="flex items-center gap-8 self-stretch cursor-pointer"
      >
        <div
          className={clsx(
            "flex flex-col justify-center items-center rounded-xl pl-[39px] pr-[38px] pt-[61px] pb-[60px] ",
            {
              "bg-light-purple": !isImageUpload,
              "text-white bg-dark-grey/25": isImageUpload,
              "": imgUrl,
            }
          )}
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
        </div>
        <p className="text-dark-grey text-base font-normal leading-[150%]">
          Image {isImageUpload ? "" : "Not"} Uploaded
        </p>
      </label>
      <input
        aria-hidden={true}
        className="opacity-0 h-0"
        type="file"
        id="image_uploads"
        name="image_uploads"
        accept=".jpg, .jpeg, .png"
        onChange={value => handleImage(value)}
      ></input>
    </section>
  )
}
