export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

/** The language of the addresses without a prefix. */
export const DEFAULT_LOCALE: Locale = "en";

/** Short label for the language switcher. */
export const LOCALE_LABEL: Record<Locale, string> = { en: "EN", id: "ID" };

/** The `og:locale` value of each language. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", id: "id_ID" };

export function isLocale(value: string): value is Locale {
	return (LOCALES as readonly string[]).includes(value);
}
