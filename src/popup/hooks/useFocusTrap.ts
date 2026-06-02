import type { RefObject } from "preact";
import { useEffect } from "preact/hooks";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions<F extends HTMLElement = HTMLElement> {
  /** When false the trap is inert: no focus is moved and no key handler runs. */
  active: boolean;
  /** Called when Escape is pressed while the trap is active. */
  onEscape: () => void;
  /** Element to focus when the trap activates. Falls back to the first focusable child. */
  initialFocusRef?: RefObject<F | null>;
}

/**
 * Confines keyboard focus to the elements inside `containerRef` while `active`.
 *
 * Handles the three concerns every modal dialog needs: initial focus on open,
 * Escape-to-close, and Tab/Shift+Tab cycling that wraps at the edges. Tearing
 * down the listener and the pending focus timer is handled on deactivate/unmount.
 */
export function useFocusTrap<C extends HTMLElement, F extends HTMLElement = HTMLElement>(
  containerRef: RefObject<C | null>,
  { active, onEscape, initialFocusRef }: UseFocusTrapOptions<F>
): void {
  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => {
      const target = initialFocusRef?.current ?? firstFocusable(containerRef.current);
      target?.focus();
    }, 0);

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = focusableElements(containerRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, onEscape, containerRef, initialFocusRef]);
}

function focusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled")
  );
}

function firstFocusable(container: HTMLElement | null): HTMLElement | undefined {
  return focusableElements(container)[0];
}
