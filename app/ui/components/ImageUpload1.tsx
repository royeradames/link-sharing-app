"use client"
import { ChangeEvent, useRef, useState } from "react"
import { clsx } from "clsx"
import Icon from "@/app/ui/components/Icon"

export function ImageUpload1({ id, name }: { id: string; name: string }) {
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

  return (
    <section>
      <div className="flex items-center gap-8 self-stretch cursor-pointer">
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
          <Icon
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
        <div>
          <p className="text-dark-grey text-base font-normal leading-[150%]">
            Image {isImageUpload ? "" : "Not"} Uploaded
          </p>
          <input
            aria-hidden={true}
            className="opacity-0 h-1 w-1"
            type="file"
            id={id}
            name={name}
            accept=".jpg, .jpeg, .png"
            onChange={handleImage}
          ></input>
        </div>
      </div>
    </section>
  )
}
