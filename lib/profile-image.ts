import { MAX_IMAGE_BYTES } from "./draft"

async function dimensions(source: string): Promise<void> {
  const img = new Image()
  img.src = source
  try {
    await img.decode()
  } catch {
    throw new Error(
      "This image could not be opened. Choose a valid PNG or JPEG."
    )
  }
  if (
    !img.naturalWidth ||
    !img.naturalHeight ||
    img.naturalWidth > 1024 ||
    img.naturalHeight > 1024
  )
    throw new Error("Choose an image no larger than 1024 × 1024 pixels.")
}
export async function validateStoredImage(source: string): Promise<void> {
  if (!source) return
  const prefix = /^data:image\/(png|jpeg);base64,/.exec(source)
  if (!prefix) throw new Error("Choose a PNG or JPEG image.")
  const bytes = atob(source.slice(prefix[0].length))
  if (bytes.length > MAX_IMAGE_BYTES)
    throw new Error("Choose an image of 256 KB or less.")
  await dimensions(source)
}
export async function readProfileImage(file: File): Promise<string> {
  if (!["image/png", "image/jpeg"].includes(file.type))
    throw new Error("Choose a PNG or JPEG image.")
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("Choose an image of 256 KB or less.")
  const bytes = new Uint8Array(await file.arrayBuffer())
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  if (
    (file.type === "image/png" && !png) ||
    (file.type === "image/jpeg" && !jpeg)
  )
    throw new Error("The file does not match its image type.")
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("This image could not be read."))
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("This image could not be read."))
    reader.readAsDataURL(file)
  })
  await validateStoredImage(source)
  return source
}
