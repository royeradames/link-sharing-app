"use client"
import Heading from "@/app/ui/components/Heading"
import Text from "@/app/ui/components/Text"
import { InputField } from "@/app/ui/inputs/InputField"
import { Button } from "@/app/ui/inputs/Button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const ProfileDetailsFormSchema = z.object({
  firstName: z.string().min(1, { message: "Can’t be empty" }),
  lastName: z.string().min(1, { message: "Can’t be empty" }),
  email: z.string().email().optional().or(z.literal("")),
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

        <section
          aria-label="user-details"
          className="flex flex-col justify-center items-center gap-3 self-stretch bg-light-grey p-5 rounded-xl"
        >
          <div className="flex flex-col justify-center items-start gap-1 self-stretch md:flex-row md:gap-4 md:items-center">
            <Text
              as="label"
              htmlFor="firstName"
              className=" text-grey text-xs font-normal leading-[150%] md:w-60 md:text-base"
            >
              First name*
            </Text>
            <InputField
              iconName=""
              name="firstName"
              placeholder="e.g. John"
              register={formMethods.register}
              errors={formMethods.formState.errors}
              id="firstName"
            />
          </div>

          <div className="flex flex-col justify-center items-start gap-1 self-stretch md:flex-row md:gap-4 md:items-center">
            <Text
              as="label"
              htmlFor="lastName"
              className=" text-grey text-xs font-normal leading-[150%] md:w-60 md:text-base"
            >
              Last name*
            </Text>
            <InputField
              iconName=""
              name="lastName"
              placeholder="e.g. Appleseed"
              register={formMethods.register}
              errors={formMethods.formState.errors}
              id="lastName"
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1 self-stretch md:flex-row md:gap-4 md:items-center">
            <Text
              as="label"
              htmlFor="email"
              className=" text-grey text-xs font-normal leading-[150%] md:w-60 md:text-base"
            >
              Email
            </Text>
            <InputField
              iconName=""
              name="email"
              placeholder="e.g. email@example.com"
              register={formMethods.register}
              errors={formMethods.formState.errors}
              id="email"
            />
          </div>
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
