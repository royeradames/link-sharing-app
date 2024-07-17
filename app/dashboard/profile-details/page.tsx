"use client"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { Button } from "@/app/ui/inputs/Button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { TextField } from "@/app/dashboard/profile-details/TextField"
import { InputImageUpload } from "@/app/ui/components/InputImageUpload"
import { LivePreview } from "@/app/ui/components/LivePreview"
import { useProfileAndLinksStoreContext } from "@/app/ProfileAndLinksStoreProvider"

const userDetailsFields: {
  label: string
  name: string
  placeholder: string
  id: string
}[] = [
  {
    label: "First name*",
    name: "firstName",
    placeholder: "e.g. John",
    id: "firstName",
  },
  {
    label: "Last name*",
    name: "lastName",
    placeholder: "e.g. Appleseed",
    id: "lastName",
  },
  {
    label: "Email",
    name: "email",
    placeholder: "e.g. email@example.com",
    id: "email",
  },
]

const fileSchema = z.instanceof(File).refine(
  file => {
    const validTypes = ["image/jpeg", "image/png"]
    return validTypes.includes(file.type)
  },
  {
    message: "Only .jpg, .jpeg, and .png files are accepted",
  }
)

const ProfileDetailsFormSchema = z.object({
  firstName: z.string().min(1, { message: "Can’t be empty" }),
  lastName: z.string().min(1, { message: "Can’t be empty" }),
  email: z.string().email().optional().or(z.literal("")),
  profilePicture: z.string().optional(),
})

export type ProfileDetailsFormValues = z.infer<typeof ProfileDetailsFormSchema>
export default function Page() {
  const userData = useProfileAndLinksStoreContext()
  const formMethods = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(ProfileDetailsFormSchema),
  })

  function onSubmit(formValues: ProfileDetailsFormValues) {
    userData.setState(current => {
      return { ...current, ...formValues }
    })
  }

  return (
    <article
      aria-label="Profile Details"
      className="flex flex-wrap gap-6 justify-center"
    >
      <LivePreview />
      <form
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch p-6 bg-white text-center rounded-xl"
      >
        <Heading as="h1" id="page-heading">
          Profile Details
        </Heading>
        <Text as="p">
          Add your details to create a personal touch to your profile.
        </Text>

        <section
          aria-label="User image"
          className="bg-light-grey p-5 rounded-xl text-left"
        >
          <h2 className="sr-only" id="user-image">
            User Image
          </h2>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <Text
              as="label"
              className="w-full text-grey font-normal leading-[150%] text-base  md:w-60"
              htmlFor="profile-picture"
            >
              Profile picture
            </Text>
            <InputImageUpload
              id="profile-picture"
              name="profilePicture"
              describedBy="profile-picture-description"
              register={formMethods.register}
              setValue={formMethods.setValue}
            />
            <p
              id="profile-picture-description"
              className="text-grey text-base font-normal leading-[150%] "
            >
              Image must be below 1024x1024px. Use PNG or JPG format.
            </p>
          </div>
        </section>
        <section
          aria-label="User details"
          className="flex flex-col justify-center items-center gap-3 self-stretch bg-light-grey p-5 rounded-xl text-left"
        >
          <h2 className="sr-only" id="user-details">
            User Details
          </h2>
          {userDetailsFields.map((fieldProperties, index) => (
            <TextField
              key={index}
              {...fieldProperties}
              register={formMethods.register}
              errors={formMethods.formState.errors}
            />
          ))}
        </section>

        <div className="border-t border-borders flex flex-col items-end gap-2 self-stretch px-10 py-6">
          <Button
            variant="primary"
            type="submit"
            onClick={() =>
              console.log(JSON.stringify(formMethods.formState.errors))
            }
          >
            Save
          </Button>
        </div>
      </form>
      {}
    </article>
  )
}
