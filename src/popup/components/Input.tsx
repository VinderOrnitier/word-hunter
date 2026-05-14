import type { JSX } from "preact";

interface InputProps {
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
  type?: "text" | "number";
  min?: number;
  step?: number;
  error?: boolean;
}

export function Input({
  value,
  onInput,
  placeholder,
  mono = false,
  type = "text",
  min,
  step,
  error = false,
}: InputProps): JSX.Element {
  return (
    <input
      type={type}
      class={`wh-input${mono ? " wh-input--mono" : ""}${error ? " wh-input--error" : ""}`}
      value={value}
      placeholder={placeholder}
      min={min}
      step={step}
      onInput={(e) => onInput((e.target as HTMLInputElement).value)}
    />
  );
}
