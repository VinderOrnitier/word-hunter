export const MAX_CUSTOM_LEN = 25;
export const VALID_CUSTOM_RE = /^[\p{L}-]+$/u;
const HAS_LETTER_RE = /\p{L}/u;

export function validateCustomWord(word: string): string | undefined {
  if (!word) return undefined;
  if (!VALID_CUSTOM_RE.test(word)) return "Letters and hyphens only";
  if (!HAS_LETTER_RE.test(word)) return "Must contain at least one letter";
  if (word.length < 2) return "Min 2 characters";
  if (word.length > MAX_CUSTOM_LEN) return `Max ${MAX_CUSTOM_LEN} characters`;
  return undefined;
}
