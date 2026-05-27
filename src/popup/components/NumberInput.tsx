import type { JSX } from "preact";

interface NumberInputProps {
  value: string;
  onInput: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
  id?: string;
}

function decimalPlaces(n: number): number {
  const parts = n.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

function roundToStep(value: number, step: number): string {
  const places = decimalPlaces(step);
  return value.toFixed(places);
}

const CHEVRON_UP = (
  <svg
    width="8"
    height="5"
    viewBox="0 0 8 5"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M1 4l3-3 3 3" />
  </svg>
);

const CHEVRON_DOWN = (
  <svg
    width="8"
    height="5"
    viewBox="0 0 8 5"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M1 1l3 3 3-3" />
  </svg>
);

export function NumberInput({
  value,
  onInput,
  min,
  max,
  step = 1,
  error = false,
  id,
}: NumberInputProps): JSX.Element {
  const current = parseFloat(value) || 0;

  const handleIncrement = (): void => {
    const next = current + step;
    if (max !== undefined && next > max) return;
    onInput(roundToStep(next, step));
  };

  const handleDecrement = (): void => {
    const next = current - step;
    if (min !== undefined && next < min) return;
    onInput(roundToStep(next, step));
  };

  return (
    <div class={`wh-numfield${error ? " wh-numfield--error" : ""}`}>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onInput={(e) => onInput((e.target as HTMLInputElement).value)}
      />
      <div class="wh-numfield__steppers">
        <button
          type="button"
          class="wh-numfield__step"
          aria-label="Increment"
          tabIndex={-1}
          onClick={handleIncrement}
        >
          {CHEVRON_UP}
        </button>
        <button
          type="button"
          class="wh-numfield__step"
          aria-label="Decrement"
          tabIndex={-1}
          onClick={handleDecrement}
        >
          {CHEVRON_DOWN}
        </button>
      </div>
    </div>
  );
}
