import { en } from "./en";
import { id } from "./id";
import type { Locale } from "./locales";

export type TextKey = keyof typeof en;
export type TextVars = Record<string, string | number>;

const dictionaries: Record<Locale, Record<TextKey, string>> = { en, id };

/** The text for `key` in `locale`, with `{name}` placeholders filled from `vars`. */
export function translate(
	locale: Locale,
	key: TextKey,
	vars?: TextVars
): string {
	return dictionaries[locale][key].replace(/\{(\w+)\}/g, (placeholder, name) =>
		vars && name in vars ? String(vars[name]) : placeholder
	);
}

/** The three lines the home headline sets on separate rows. */
export function headlineLines(locale: Locale): string[] {
	return [
		translate(locale, "home.line1"),
		translate(locale, "home.line2"),
		translate(locale, "home.line3"),
	];
}

/** The headline as one sentence. */
export function tagline(locale: Locale): string {
	return headlineLines(locale).join(" ");
}
