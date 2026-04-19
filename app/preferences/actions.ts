"use server";

import { cookies } from "next/headers";

export async function setLocale(locale: "fr" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function setTheme(theme: "dark" | "light") {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
