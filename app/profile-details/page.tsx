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
          <div className="flex items-center gap-4 self-stretch">
            <Text
              as="label"
              htmlFor="firstName"
              className="w-60 text-[color:var(--Grey,#737373)] [font-family:'Instrument_Sans'] text-base font-normal leading-[150%]"
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
