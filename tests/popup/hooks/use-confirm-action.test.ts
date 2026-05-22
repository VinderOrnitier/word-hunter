import { act, renderHook } from "@testing-library/preact";
import { useConfirmAction } from "../../../src/popup/hooks/useConfirmAction";

describe("useConfirmAction", () => {
  it("armed is false on initial render", () => {
    const { result } = renderHook(() => useConfirmAction({ onConfirm: jest.fn() }));
    expect(result.current.armed).toBe(false);
  });

  it("arm() sets armed to true", () => {
    const { result } = renderHook(() => useConfirmAction({ onConfirm: jest.fn() }));
    act(() => {
      result.current.arm();
    });
    expect(result.current.armed).toBe(true);
  });

  it("confirm() calls onConfirm and resets armed to false", () => {
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useConfirmAction({ onConfirm }));

    act(() => {
      result.current.arm();
    });
    act(() => {
      result.current.confirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.armed).toBe(false);
  });

  it("cancel() resets armed to false without calling onConfirm", () => {
    const onConfirm = jest.fn();
    const { result } = renderHook(() => useConfirmAction({ onConfirm }));

    act(() => {
      result.current.arm();
    });
    act(() => {
      result.current.cancel();
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.armed).toBe(false);
  });
});
