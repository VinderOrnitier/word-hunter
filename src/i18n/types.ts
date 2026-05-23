import { en } from "./messages/en";

export type Locale = "en" | "uk" | "de" | "ja";
export type MessageKey = keyof typeof en;
