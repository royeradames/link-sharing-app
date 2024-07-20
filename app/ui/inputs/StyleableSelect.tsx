import React, { useEffect, useRef, useState } from "react"
import { UseFormRegister, UseFormSetValue } from "react-hook-form"
import { SlIcon } from "@/shoelace-wrappers"
import { clsx } from "clsx"

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
  setValue: UseFormSetValue<any>
  name: string
}

const StyleableSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder,
  onSelect,
  register,
  setValue,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  )
  const selectRef = useRef<HTMLDivElement>(null)
  const optionsListRef = useRef<HTMLUListElement>(null)

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option)
    setIsOpen(false)
    if (onSelect) onSelect(option)
    setValue(name, option.value) // Update form value
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
        if (isOpen) {
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
          handleOptionClick(options[focusedOptionIndex])
        }
        event.preventDefault()
        break
      case "Escape":
        setIsOpen(false)
        break
      case "Space":
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setIsOpen(false)
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div
      className="relative text-black focus-visible:shadow
          focus-visible:shadow-purple/25
          focus-visible:border-purple focus-visible:outline-none"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="options-listbox"
      ref={selectRef}
    >
      <div
        className="
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
          open:shadow
          open:shadow-purple/25
          open:border-purple
        "
        onClick={() => setIsOpen(prev => !prev)}
        tabIndex={-1}
        open={isOpen || undefined}
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
      </div>
      {isOpen && (
        <ul
          id="options-listbox"
          className="absolute top-full left-0 w-full border border-gray-300 rounded bg-white z-10 max-h-60 overflow-auto"
          role="listbox"
          ref={optionsListRef}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              className={clsx(
                `flex gap-3 items-center p-2 cursor-pointer text-dark-grey ${focusedOptionIndex === index ? "bg-gray-200" : "hover:bg-gray-100"}`,
                {
                  "text-purple": option.value === selectedOption?.value,
                }
              )}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={selectedOption?.value === option.value}
              tabIndex={-1}
            >
              <SlIcon name={option.iconName} />
              <span>{option.label}</span>
              {option.value === selectedOption?.value ? "(Selected)" : ""}
            </li>
          ))}
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
