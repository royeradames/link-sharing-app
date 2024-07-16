import { ChangeEvent, useEffect, useRef, useState } from "react"
import { clsx } from "clsx"
import { UseFormRegister } from "react-hook-form"
import { SlIcon } from "@/shoelace-wrappers"

export function InputImageUpload({
  register,
  id,
  name,
  describedBy,
  setValue,
}: {
  id: string
  name: string
  describedBy?: string
  register: UseFormRegister<any>
  setValue: any
}) {
  const [isImageUpload, setIsImageUpload] = useState(false)
  const [imgUrl, setImgUrl] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  /**
   * handling image upload.
   * In the end, I will be going with saving the string because I can use that string has with the css url to render the image.
   * https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
   */
  useEffect(() => {
    setValue(name, imgUrl)
  }, [imgUrl, name])
  function handleImage(input: ChangeEvent<HTMLInputElement>) {
    const file = input.target.files?.[0]
    if (!file) {
      setIsImageUpload(false)
      setImgUrl("")
      return
    }

    setValue(name, file)
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
      className={clsx(
        "w-[116px] h-[72px] flex-shrink-0 cursor-pointer flex flex-col justify-center items-center bg-light-purple rounded-xl pl-[39px] pr-[38px] pt-[61px] pb-[60px] box-content",
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
        className={clsx("text-purple text-base font-semibold leading-[150%]", {
          "text-white": isImageUpload,
        })}
      >
        {isImageUpload ? "Change Image" : "+ Upload Image"}
      </span>
      <input
        aria-hidden={true}
        className="sr-only"
        type="file"
        id={id}
        accept=".jpg, .jpeg, .png"
        tabIndex={-1}
        aria-describedby={describedBy}
        {...register(name)}
        ref={inputRef}
        onChange={handleImage}
      ></input>
    </div>
  )
}
