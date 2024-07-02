import Text from "@/app/ui/components/Text"
import { InputField } from "@/app/ui/inputs/InputField"

export function TextField({
  register,
  errors,
  id,
  placeholder,
  name,
  label,
}: any) {
  return (
    <div className="flex flex-col justify-center items-start gap-1 self-stretch md:flex-row md:gap-4 md:items-center">
      <Text
        as="label"
        htmlFor="firstName"
        className=" text-grey text-xs font-normal leading-[150%] md:w-60 md:text-base"
      >
        {label}
      </Text>
      <InputField
        iconName=""
        name={name}
        placeholder={placeholder}
        register={register}
        errors={errors}
        id={id}
      />
    </div>
  )
}
