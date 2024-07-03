"use client"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { Button } from "@/app/ui/inputs/Button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { TextField } from "@/app/profile-details/TextField"
import { ImageUpload } from "@/app/ui/components/ImageUpload"

const ProfileDetailsFormSchema = z.object({
  firstName: z.string().min(1, { message: "Can’t be empty" }),
  lastName: z.string().min(1, { message: "Can’t be empty" }),
  email: z.string().email().optional().or(z.literal("")),
  profilePicture: z.string().min(1, { message: "Can’t be empty" }),
})

type ProfileDetailsFormValues = z.infer<typeof ProfileDetailsFormSchema>
export default function Page() {
  const formMethods = useForm<ProfileDetailsFormValues>({
    resolver: zodResolver(ProfileDetailsFormSchema),
  })

  function onSubmit(formValues: ProfileDetailsFormValues) {
    console.log(formValues)
    alert(JSON.stringify(formValues))
  }

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
  return (
    <article aria-label="Profile Details">
      <form
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="flex flex-col items-stretch gap-10 flex-[1_0_0] self-stretch p-6 bg-white text-center"
      >
        <Heading as="h1" id="page-heading">
          Profile Details
        </Heading>
        <Text as="p">
          Add your details to create a personal touch to your profile.
        </Text>

        <section aria-label="User Image">
          {/*<div className="flex items-center gap-8 self-stretch ">*/}
          <Text
            as="label"
            className="w-full text-grey text-xs font-normal leading-[150%] md:w-60 md:text-base"
            htmlFor="profile-picture"
          >
            Profile picture
          </Text>
          <ImageUpload
            id="profile-picture"
            name="profilePicture"
            description="Image must be below 1024x1024px. Use PNG or JPG format."
          />
          {/*</div>*/}
        </section>
        <section
          aria-label="user-details"
          className="flex flex-col justify-center items-center gap-3 self-stretch bg-light-grey p-5 rounded-xl text-left"
        >
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
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </article>
  )
}
