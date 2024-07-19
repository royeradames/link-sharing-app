import { useEffect, useRef, useState } from "react"
import { UseFormRegister, UseFormSetValue } from "react-hook-form"

interface Option {
  value: string
  label: string
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
      className="relative text-black"
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
        className="p-2 border border-gray-300 rounded bg-white cursor-pointer"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {selectedOption ? selectedOption.label : placeholder}
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
              className={`p-2 cursor-pointer ${focusedOptionIndex === index ? "bg-gray-200" : "hover:bg-gray-100"}`}
              onClick={() => handleOptionClick(option)}
              role="option"
              aria-selected={selectedOption?.value === option.value}
              tabIndex={-1}
            >
              {option.label}
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
