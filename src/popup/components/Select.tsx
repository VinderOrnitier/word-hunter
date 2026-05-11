import type { JSX } from "preact";

export type SelectOption = string | { value: string; label: string };

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: SelectOption[];
}

function asOption(opt: SelectOption): { value: string; label: string } {
  return typeof opt === "string" ? { value: opt, label: opt } : opt;
}

export function Select({ value, onChange, children }: SelectProps): JSX.Element {
  return (
    <select
      class="wh-select"
      value={value}
      onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
    >
      {children.map((opt) => {
        const { value: v, label } = asOption(opt);
        return (
          <option key={v} value={v}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
