import type { ComponentChildren, JSX } from "preact";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: ComponentChildren;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  leftIcon?: IconName;
}

export function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  leftIcon,
}: ButtonProps): JSX.Element {
  return (
    <button
      type="button"
      class={`wh-btn wh-btn--${variant} wh-btn--${size}`}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {leftIcon && <Icon name={leftIcon} size={14} />}
      {children}
    </button>
  );
}
