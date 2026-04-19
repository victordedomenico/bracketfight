import { cookies } from "next/headers";
import { fr } from "./fr";
import { en } from "./en";

export type Locale = "fr" | "en";
export type { Dictionary } from "./fr";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "en" ? "en" : "fr";
}

export function getDictionary(locale: Locale) {
  return locale === "en" ? en : fr;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
