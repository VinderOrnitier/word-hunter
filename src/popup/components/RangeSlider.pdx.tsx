import type { JSX } from "preact";

interface RangeSliderPdxProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (value: number) => void;
  id?: string;
  ariaLabel?: string;
}

const CELL_COUNT = 12;

export function RangeSliderPdx({
  value,
  min,
  max,
  step,
  onInput,
  id,
  ariaLabel,
}: RangeSliderPdxProps): JSX.Element {
  const ratio = max > min ? (value - min) / (max - min) : 0;
  const head = Math.min(CELL_COUNT - 1, Math.max(0, Math.round(ratio * (CELL_COUNT - 1))));

  return (
    <div class="pdx-range-mini">
      <div class="pdx-range-mini__strip">
        {Array.from({ length: CELL_COUNT }, (_, i) => {
          const state = i === head ? " is-head" : i < head ? " is-filled" : "";
          return <div key={i} class={`pdx-range-mini__cell${state}`} />;
        })}
        <input
          id={id}
          type="range"
          class="pdx-range-mini__input"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
        />
      </div>
      <span class="pdx-range-mini__chip">{value}</span>
    </div>
  );
}
