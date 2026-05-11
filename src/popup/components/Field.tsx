import type { ComponentChildren, JSX } from "preact";

interface FieldProps {
  label: string;
  helper?: string;
  children: ComponentChildren;
}

export function Field({ label, helper, children }: FieldProps): JSX.Element {
  return (
    <div class="wh-field">
      <label class="wh-field__label">{label}</label>
      {children}
      {helper && <span class="wh-field__helper">{helper}</span>}
    </div>
  );
}
