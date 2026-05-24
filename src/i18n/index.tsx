import type { JSX } from "preact";
import { type ComponentChildren, createContext } from "preact";
import { useCallback, useContext } from "preact/hooks";
import { useStorage } from "../popup/hooks/useStorage";
import { de } from "./messages/de";
import { en } from "./messages/en";
import { ja } from "./messages/ja";
import { uk } from "./messages/uk";
import type { Locale, MessageKey } from "./types";

export type { Locale, MessageKey } from "./types";

// ---------------------------------------------------------------------------
// Core translation function
// ---------------------------------------------------------------------------

const dictionaries: Record<Locale, Partial<Record<MessageKey, string>>> = {
  en,
  uk,
  de,
  ja,
};

export function t(
  key: MessageKey,
  locale: Locale,
  params?: Record<string, string | number>
): string {
  const raw = dictionaries[locale][key] ?? en[key];
  if (!params) return raw;
  return Object.entries(params).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, String(v)), raw);
}

// ---------------------------------------------------------------------------
// Preact context
// ---------------------------------------------------------------------------

type TFunction = (key: MessageKey, params?: Record<string, string | number>) => string;

const defaultT: TFunction = (key, params) => t(key, "en", params);
const LocaleContext = createContext<TFunction>(defaultT);

export function LocaleProvider({ children }: { children: ComponentChildren }): JSX.Element {
  const [locale] = useStorage("locale", "en");
  const boundT = useCallback<TFunction>((key, params) => t(key, locale, params), [locale]);
  return <LocaleContext.Provider value={boundT}>{children}</LocaleContext.Provider>;
}

export function useT(): TFunction {
  return useContext(LocaleContext);
}

// ---------------------------------------------------------------------------
// Content-script helper (no Preact context available)
// ---------------------------------------------------------------------------

export async function getLocale(): Promise<Locale> {
  const result = await chrome.storage.local.get("locale");
  return (result.locale as Locale | undefined) ?? "en";
}
