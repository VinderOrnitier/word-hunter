import { act, renderHook } from "@testing-library/preact";
import { useCustomWordForm } from "../../../src/popup/play/useCustomWordForm";

describe("useCustomWordForm", () => {
  it("starts with an empty value", () => {
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit: jest.fn() }));
    expect(result.current.value).toBe("");
  });

  it("setValue updates the value", () => {
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit: jest.fn() }));
    act(() => result.current.setValue("dragon"));
    expect(result.current.value).toBe("dragon");
  });

  it("reports a validation error for invalid input", () => {
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit: jest.fn() }));
    act(() => result.current.setValue("bad!"));
    expect(result.current.error).toMatch(/letters and hyphens only/i);
  });

  it("has no error for valid input", () => {
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit: jest.fn() }));
    act(() => result.current.setValue("unicorn"));
    expect(result.current.error).toBeUndefined();
  });

  it("keeps showError false until a submit is attempted", () => {
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit: jest.fn() }));
    act(() => result.current.setValue("bad!"));
    expect(result.current.showError).toBe(false);
    act(() => result.current.handleSubmit());
    expect(result.current.showError).toBe(true);
  });

  it("submits the trimmed word when valid", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit }));
    act(() => result.current.setValue("  unicorn  "));
    act(() => result.current.handleSubmit());
    expect(onSubmit).toHaveBeenCalledWith("unicorn");
  });

  it("does not submit when the value is empty", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useCustomWordForm({ open: true, onSubmit }));
    act(() => result.current.handleSubmit());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("resets the value when the modal is reopened", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useCustomWordForm({ open, onSubmit: jest.fn() }),
      { initialProps: { open: true } }
    );
    act(() => result.current.setValue("abc"));
    expect(result.current.value).toBe("abc");
    rerender({ open: false });
    rerender({ open: true });
    expect(result.current.value).toBe("");
  });
});
