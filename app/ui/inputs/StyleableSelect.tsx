import React, { ReactNode, useEffect, useRef, useState } from "react"
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { SlIcon } from "@/shoelace-wrappers"
import { clsx } from "clsx"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
  iconName?: string
}

interface CustomSelectProps {
  options: Option[]
  placeholder: string
  onSelect?: (option: Option) => void
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  name: string
  children: ReactNode
}

const StyleableSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder,
  onSelect,
  register,
  setValue,
  watch,
  name,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  )
  const selectRef = useRef<HTMLDivElement>(null)
  const optionsListRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let selectedOptionIndex = focusedOptionIndex
    options.find((option, index) => {
      if (option.value === selectedOption?.value) selectedOptionIndex = index
    })
    setFocusedOptionIndex(selectedOptionIndex)
  }, [isOpen])

  const handleOptionClick = (option: Option, index: number) => {
    setSelectedOption(option)
    setIsOpen(false)
    if (onSelect) onSelect(option)
    setValue(name, option.value)
    setFocusedOptionIndex(index)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.code) {
      case "ArrowDown":
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedOptionIndex(prev =>
            prev === null ? 0 : Math.min(prev + 1, options.length - 1)
          )
        }
        event.preventDefault()
        break
      case "ArrowUp":
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setFocusedOptionIndex(prev =>
            prev === null ? options.length - 1 : Math.max(prev - 1, 0)
          )
        }
        event.preventDefault()
        break
      case "Enter":
        if (!isOpen) {
          setIsOpen(true)
        } else if (focusedOptionIndex !== null) {
          handleOptionClick(options[focusedOptionIndex], focusedOptionIndex)
        }
        event.preventDefault()
        break
      case "Escape":
        setIsOpen(false)
        break
      case "Space":
        if (!isOpen) {
          setIsOpen(true)
        } else if (focusedOptionIndex !== null) {
          handleOptionClick(options[focusedOptionIndex], focusedOptionIndex)
        }
        event.preventDefault()
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (isOpen && focusedOptionIndex !== null) {
      const optionElement = optionsListRef.current?.children[focusedOptionIndex]
      optionElement?.scrollIntoView({ block: "nearest" })
    }
  }, [focusedOptionIndex, isOpen])

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  const handleBlur = (event: React.FocusEvent) => {
    if (!selectRef.current?.contains(event.relatedTarget)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    setDefaultValue()
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  function setDefaultValue() {
    const defaultValue: Option["value"] | undefined = watch(name)
    if (!defaultValue) {
      return
    }
    const selectedOption = options.find(option => option.value === defaultValue)
    if (!selectedOption) {
      return
    }
    setSelectedOption(selectedOption)
  }
  return (
    <div
      className="relative text-black "
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="options-listbox"
      ref={selectRef}
    >
      <button
        type="button"
        className={cn(
          clsx(
            `
            w-full
            text-left
          grid gap-3 items-center grid-cols-[max-content,1fr,max-content]
          py-2
          px-4
          border
          border-gray-300
          rounded bg-white
          cursor-pointer
          text-dark-grey
          hover:shadow
          hover:shadow-purple/25
          hover:border-purple
          focus-visible:shadow
          focus-visible:shadow-purple/25
          focus-visible:border-purple
          focus-visible:outline-none
          `,
            {
              "open:shadow open:shadow-purple/25 open:border-purple": isOpen,
            }
          )
        )}
        onClick={() => setIsOpen(prev => !prev)}
        tabIndex={0}
        id={name}
      >
        <SlIcon
          name="link-45deg"
          aria-hidden
          className="h-5 w-5 text-grey flex"
        />
        {selectedOption ? selectedOption.label : placeholder}
        <SlIcon
          name={isOpen ? "arrow-up" : "arrow-down"}
          aria-hidden
          className="w-3 h-1.5 text-grey flex"
        />
      </button>
      {isOpen && (
        <ul
          id="options-listbox"
          className="absolute top-full left-0 w-full border border-gray-300 rounded bg-white z-10 max-h-60 overflow-auto"
          role="listbox"
          ref={optionsListRef}
        >
          {React.Children.map(children, (child, index) =>
            React.isValidElement<any>(child)
              ? React.cloneElement(child, {
                  isSelected: child.props.value === selectedOption?.value,
                  isFocused: index === focusedOptionIndex,
                  onClick: () => handleOptionClick(options[index], index),
                })
              : child
          )}
        </ul>
      )}
      <input type="hidden" {...register(name)} />
      {/*
          Hidden input for form registration
          the value change is being handle through the setValue
       */}
    </div>
  )
}

export default StyleableSelect
