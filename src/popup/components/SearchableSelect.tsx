import type { JSX } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import type { SelectOption } from "./Select";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  children: SelectOption[];
}

function asOption(opt: SelectOption): { value: string; label: string } {
  return typeof opt === "string" ? { value: opt, label: opt } : opt;
}

interface DropdownPos { top: number; left: number; width: number }

export function SearchableSelect({ value, onChange, children }: SearchableSelectProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = children.map(asOption);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      setQuery("");
    } else {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setDropdownPos({ top: rect.bottom - 1, left: rect.left, width: rect.width });
      }
      setOpen(true);
    }
  };

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  return (
    <div class="wh-ss" ref={wrapRef} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        class={`wh-ss__trigger${open ? " is-open" : ""}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selectedLabel}
      </button>

      {open && dropdownPos && (
        <div
          class="wh-ss__dropdown"
          role="listbox"
          style={`top:${dropdownPos.top}px;left:${dropdownPos.left}px;width:${dropdownPos.width}px`}
        >
          <input
            ref={inputRef}
            class="wh-ss__search"
            type="text"
            placeholder="Search…"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
          <div class="wh-ss__list">
            {filtered.length === 0 ? (
              <div class="wh-ss__empty">No results for "{query}"</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  class={`wh-ss__option${opt.value === value ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => select(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
