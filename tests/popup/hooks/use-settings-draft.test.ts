import { act, renderHook } from "@testing-library/preact";
import { useSettingsDraft } from "../../../src/popup/hooks/useSettingsDraft";
import { DEFAULT_SETTINGS } from "../../../src/shared/constants";

describe("useSettingsDraft", () => {
  it("starts clean with the draft mirroring saved settings", () => {
    const { result } = renderHook(() => useSettingsDraft());
    expect(result.current.isDirty).toBe(false);
    expect(result.current.draft).toEqual(DEFAULT_SETTINGS);
  });

  it("update() applies a patch and marks the draft dirty", () => {
    const { result } = renderHook(() => useSettingsDraft());
    act(() => result.current.update({ minWordThreshold: 120 }));
    expect(result.current.draft.minWordThreshold).toBe(120);
    expect(result.current.isDirty).toBe(true);
  });

  it("update() merges without clobbering other draft fields", () => {
    const { result } = renderHook(() => useSettingsDraft());
    act(() => result.current.update({ minWordThreshold: 120 }));
    act(() => result.current.update({ showReloadHint: !DEFAULT_SETTINGS.showReloadHint }));
    expect(result.current.draft.minWordThreshold).toBe(120);
    expect(result.current.draft.showReloadHint).toBe(!DEFAULT_SETTINGS.showReloadHint);
  });

  it("changing the locale draft marks dirty", () => {
    const { result } = renderHook(() => useSettingsDraft());
    act(() => result.current.setDraftLocale("uk"));
    expect(result.current.draftLocale).toBe("uk");
    expect(result.current.isDirty).toBe(true);
  });

  it("cancel() reverts the draft and clears dirty", () => {
    const { result } = renderHook(() => useSettingsDraft());
    act(() => result.current.update({ minWordThreshold: 120 }));
    act(() => result.current.setDraftLocale("de"));
    act(() => result.current.cancel());
    expect(result.current.draft).toEqual(DEFAULT_SETTINGS);
    expect(result.current.draftLocale).toBe("en");
    expect(result.current.isDirty).toBe(false);
  });

  it("save() persists the draft so the form is no longer dirty", () => {
    const { result } = renderHook(() => useSettingsDraft());
    act(() => result.current.update({ minWordThreshold: 120 }));
    expect(result.current.isDirty).toBe(true);
    act(() => result.current.save());
    expect(result.current.isDirty).toBe(false);
    expect(result.current.draft.minWordThreshold).toBe(120);
  });
});
