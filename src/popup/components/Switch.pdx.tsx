import type { JSX } from "preact";

interface SwitchPdxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
}

export function SwitchPdx({
  checked,
  onChange,
  ariaLabel,
  title,
  disabled = false,
}: SwitchPdxProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      class={`pdx-switch-mini${checked ? " is-on" : ""}`}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
    >
      {/* OFF/ON are decorative device-chrome prints (like the WORD HUNTER wordmark), not state */}
      <span class="pdx-switch-mini__labels">
        <span>OFF</span>
        <span>ON</span>
      </span>
      <span class="pdx-switch-mini__cap" />
    </button>
  );
}
