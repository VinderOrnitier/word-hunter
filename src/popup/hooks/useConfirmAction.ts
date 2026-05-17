import { useState } from "preact/hooks";

export interface UseConfirmActionOptions {
  onConfirm: () => void;
}

export interface UseConfirmActionResult {
  armed: boolean;
  arm: () => void;
  confirm: () => void;
  cancel: () => void;
}

export function useConfirmAction({ onConfirm }: UseConfirmActionOptions): UseConfirmActionResult {
  const [armed, setArmed] = useState(false);

  return {
    armed,
    arm:     () => setArmed(true),
    cancel:  () => setArmed(false),
    confirm: () => { setArmed(false); onConfirm(); },
  };
}
