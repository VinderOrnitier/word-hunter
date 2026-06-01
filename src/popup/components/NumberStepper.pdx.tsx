import type { JSX } from "preact";

interface NumberStepperPdxProps {
  value: string;
  onInput: (value: string) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}

function decimalPlaces(n: number): number {
  const parts = n.toString().split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

function roundToStep(value: number, step: number): string {
  return value.toFixed(decimalPlaces(step));
}

const MINUS = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 11h16v2H4z" />
  </svg>
);

const PLUS = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" />
  </svg>
);

export function NumberStepperPdx({
  value,
  onInput,
  unit,
  min,
  max,
  step = 1,
}: NumberStepperPdxProps): JSX.Element {
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
    <div class="pdx-stepper-mini">
      <button
        type="button"
        class="pdx-stepper-mini__key"
        aria-label="Decrement"
        tabIndex={-1}
        onClick={handleDecrement}
      >
        {MINUS}
      </button>
      <div class="pdx-stepper-mini__lcd" aria-live="polite">
        <span class="pdx-stepper-mini__value">{value}</span>
        <span class="pdx-stepper-mini__unit">{unit}</span>
      </div>
      <button
        type="button"
        class="pdx-stepper-mini__key"
        aria-label="Increment"
        tabIndex={-1}
        onClick={handleIncrement}
      >
        {PLUS}
      </button>
    </div>
  );
}
