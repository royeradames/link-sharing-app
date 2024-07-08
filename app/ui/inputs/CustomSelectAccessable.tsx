import { useEffect, useRef, useState } from "react"

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  placeholder: string
  onSelect: (option: Option) => void
}

/**
 *
 * @param options
 * @param placeholder
 * @param onSelect
 * @constructor
 *
 * The <select> element is notoriously difficult to style productively with CSS. You can affect certain aspects like any element — for example, manipulating the box model, the displayed font, etc., and you can use the appearance property to remove the default system appearance.
 *
 * However, these properties don't produce a consistent result across browsers, and it is hard to do things like line different types of form element up with one another in a column. The <select> element's internal structure is complex, and hard to control. If you want to get full control, you should consider using a library with good facilities for styling form widgets, or try rolling your own dropdown menu using non-semantic elements, JavaScript, and WAI-ARIA to provide semantics.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#styling_with_css
 */
const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder,
  onSelect,
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
    onSelect(option)
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
      className="relative w-64"
      onClick={() => setIsOpen(prev => !prev)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      tabIndex={0}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="options-listbox"
      ref={selectRef}
    >
      <div className="p-2 border border-gray-300 rounded bg-white cursor-pointer">
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
    </div>
  )
}

export default CustomSelect
