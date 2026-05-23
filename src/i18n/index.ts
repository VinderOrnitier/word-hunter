import type { Locale, MessageKey } from "./types";
import { en } from "./messages/en";

export type { Locale, MessageKey } from "./types";

const dictionaries: Record<Locale, Partial<Record<MessageKey, string>>> = {
  en,
  uk: {},
  de: {},
  ja: {},
};

export function t(
  key: MessageKey,
  locale: Locale,
  params?: Record<string, string | number>
): string {
  const raw = dictionaries[locale][key] ?? en[key];
  if (!params) return raw;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
    raw
  );
}
