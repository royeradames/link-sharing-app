"use client";
// TEMPORARY local modification of Royer UI's combobox: the id, invalid and
// describedBy props and the removed open-on-focus below. They are being fixed
// upstream in royer-ui branch fix/ui-combobox-gaps-20261011 (its PR is not
// open yet). When that lands, remove on reinstall: run
// `npx shadcn@4.21.3 add https://ui.royeradames.com/r/combobox.json` and keep
// the file unmodified.
import { useEffect, useId, useRef, useState } from "react";
import { Input } from "./input";
export function Combobox({
  id: idProp,
  invalid = false,
  describedBy,
  label,
  options,
  value,
  onValueChange,
  disabled = false,
  blocked = false,
  placeholder = "Search options",
}: {
  // Local addition (Devlinks): a stable id so the app can focus a row's
  // field, and the invalid state with its message id for assistive tech.
  id?: string;
  invalid?: boolean;
  describedBy?: string;
  label: string;
  options: { value: string; label: string; keywords?: string[] }[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  // Busy, not disabled: a request elsewhere is pending. The field stays
  // focusable and announced as unavailable, but the list stays closed and the
  // value holds until it settles. The caller says why in visible text.
  blocked?: boolean;
  placeholder?: string;
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const list = useRef<HTMLUListElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
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
  const openList = () => {
    if (blocked) return;
    setOpen(true);
    setQuery("");
    setActive(0);
  };
  const choose = (next: string) => {
    if (blocked) return;
    onValueChange(next);
    setOpen(false);
    setQuery("");
  };
  return (
    <div
      className="relative grid gap-2"
      onPointerMove={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <Input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={
          open && filtered[active] ? `${id}-option-${active}` : undefined
        }
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        readOnly={blocked}
        aria-disabled={blocked || undefined}
        value={open && !blocked ? query : (selected?.label ?? "")}
        placeholder={placeholder}
        // Local change (Devlinks): no onFocus={openList}. The app focuses
        // this field after Add and after a failed save; opening there covered
        // the next field and this field's own error. Click, typing or the
        // arrow keys still open the list.
        onClick={() => {
          if (!open) openList();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setQuery("");
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              openList();
              return;
            }
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
      {open && !blocked && (
        <div className="absolute top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[var(--rui-radius)] border border-[var(--rui-control-line)] bg-[var(--rui-surface)] p-1 shadow-lg">
          <ul ref={list} id={`${id}-list`} role="listbox" aria-label={label}>
            {filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={`cursor-pointer rounded-[var(--rui-radius)] px-3 py-3 text-sm ${index === active ? "bg-[var(--rui-soft)]" : ""}`}
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
          </ul>
          {!filtered.length && (
            <p role="status" className="p-3 text-sm text-[var(--rui-muted)]">
              No matching options.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
