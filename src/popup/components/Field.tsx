import type { ComponentChildren, JSX } from "preact";

interface FieldProps {
  label: string;
  helper?: string;
  error?: string;
  counter?: string;
  children: ComponentChildren;
}

export function Field({ label, helper, error, counter, children }: FieldProps): JSX.Element {
  return (
    <div class="wh-field">
      <div class="wh-field__header">
        <label class="wh-field__label">{label}</label>
        {counter !== undefined && (
          <span class={`wh-field__counter${error ? " wh-field__counter--error" : ""}`}>
            {counter}
          </span>
        )}
      </div>
      {children}
      {helper && (
        <span class={error ? "wh-field__error" : "wh-field__helper"}>
          {error ?? helper}
        </span>
      )}
    </div>
  );
}
