"use client";
import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { Input } from "./input";
export function Combobox({
  id: idProp,
  label,
  options,
  value,
  onValueChange,
  disabled = false,
  blocked = false,
  invalid = false,
  "aria-invalid": ariaInvalid,
  "aria-describedby": describedBy,
  openOnFocus = false,
  placeholder = "Search options",
  emptyText = "No matching options.",
  onBlur,
}: {
  // A stable id lets a form focus this field, for example the first invalid
  // field after a failed save. The list and options derive their ids from it.
  id?: string;
  label: string;
  options: { value: string; label: string; keywords?: string[] }[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  // Busy, not disabled: a request elsewhere is pending. The field stays
  // focusable and announced as unavailable, but the list stays closed and the
  // value holds until it settles. The caller says why in visible text.
  blocked?: boolean;
  // The caller's validation failed for this field. Either prop marks it.
  invalid?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  // The id of the caller's error or hint text, linked to the field.
  "aria-describedby"?: string;
  // Off by default: a form that moves focus here after Add or a failed save
  // would otherwise cover the next field and this field's own error. Typing,
  // ArrowDown, a click or the caret open the list.
  openOnFocus?: boolean;
  placeholder?: string;
  emptyText?: string;
  // Called when the field itself loses focus, for touched-state validation.
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const list = useRef<HTMLUListElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";
  const selected = options.find((option) => option.value === value);
  const terms = query
    .toLowerCase()
    .trim()
    .split(/[\s_-]+/);
  const filtered = options.filter((option) => {
    const text = [option.label, ...(option.keywords ?? [])]
      .join(" ")
      .toLowerCase()
      .replace(/[_-]/g, " ");
    return terms.every((term) => text.includes(term));
  });
  useEffect(() => {
    if (open)
      list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open, query]);
  const openList = (at: "first" | "last" = "first") => {
    if (blocked) return;
    setOpen(true);
    setQuery("");
    setActive(at === "last" ? Math.max(0, options.length - 1) : 0);
  };
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const choose = (next: string) => {
    if (blocked) return;
    onValueChange(next);
    close();
  };
  const expanded = open && !blocked;
  const empty = expanded && filtered.length === 0;
  return (
    <div
      className="relative grid gap-2"
      onPointerMove={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <label htmlFor={id} className="text-base">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          aria-activedescendant={
            empty
              ? `${id}-empty`
              : expanded && filtered[active]
                ? `${id}-option-${active}`
                : undefined
          }
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          disabled={disabled}
          readOnly={blocked}
          aria-disabled={blocked || undefined}
          value={open && !blocked ? query : (selected?.label ?? "")}
          placeholder={placeholder}
          // SEL1: 40px end padding keeps typed text clear of the caret.
          className="pe-10"
          onBlur={onBlur}
          onFocus={() => {
            if (openOnFocus) openList();
          }}
          onClick={() => {
            if (!open) openList();
          }}
          onChange={(event) => {
            if (blocked) return;
            setQuery(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          // React skips onChange when the typed text equals the shown label
          // (a paste or autofill of the current value), which would leave the
          // list closed now that focus no longer opens it. The native input
          // event always fires.
          onInput={(event) => {
            if (blocked || open) return;
            setQuery(event.currentTarget.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(event) => {
            // Keys pressed while an IME composes text belong to the IME.
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Escape") {
              // Closing the list must not also close a surrounding dialog.
              if (expanded) {
                event.preventDefault();
                event.stopPropagation();
              }
              close();
              return;
            }
            if (event.altKey && event.key === "ArrowUp") {
              event.preventDefault();
              close();
              return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) {
                // APG: Down opens on the first option, Up on the last, and
                // Alt+Down opens without moving past the first.
                openList(
                  event.key === "ArrowUp" && !event.altKey ? "last" : "first",
                );
                return;
              }
              if (event.altKey) return;
              setActive(
                (current) =>
                  (current +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    Math.max(filtered.length, 1)) %
                  Math.max(filtered.length, 1),
              );
            }
            if (open && event.key === "Enter") {
              event.preventDefault();
              const option = filtered[active];
              if (option) choose(option.value);
            }
            if (open && (event.key === "Home" || event.key === "End")) {
              event.preventDefault();
              setActive(
                event.key === "Home" ? 0 : Math.max(0, filtered.length - 1),
              );
            }
          }}
        />
        {/* SEL1: the caret sits 12px inside the end edge. It ignores the
            pointer, so a press on it lands on the field, which opens the list. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={`pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--rui-muted)] motion-safe:transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path
            d="M3.5 6l4.5 4.5L12.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* The listbox stays rendered while expanded, so aria-controls always
            names it. With no matches it holds one unavailable option carrying
            the empty text, which becomes the active descendant and is read. */}
        {expanded && (
          <ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            className="absolute top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--rui-radius)] border border-[var(--rui-control-line)] bg-[var(--rui-surface)] p-1 shadow-lg"
          >
            {filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={`cursor-pointer rounded-[var(--rui-radius)] px-3 py-3 text-base ${index === active ? "bg-[var(--rui-soft)]" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onPointerMove={(event) => {
                  if (event.pointerType === "touch") return;
                  // Scrolling can move a row under a stationary pointer.
                  const previous = pointer.current;
                  if (
                    !previous ||
                    previous.x !== event.clientX ||
                    previous.y !== event.clientY
                  )
                    setActive(index);
                }}
                onClick={() => choose(option.value)}
              >
                {option.label}
                {option.value === value && <span aria-hidden="true"> ✓</span>}
              </li>
            ))}
            {empty && (
              <li
                id={`${id}-empty`}
                role="option"
                aria-disabled="true"
                aria-selected="false"
                className="px-3 py-2 text-base text-[var(--rui-muted)]"
                onMouseDown={(event) => event.preventDefault()}
              >
                {emptyText}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
