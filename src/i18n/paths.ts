import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

const PREFIXED = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** The language of an address and the page it stands for, without the language prefix. */
export function splitLocale(pathname: string): {
	locale: Locale;
	path: string;
} {
	for (const locale of PREFIXED) {
		if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
			const rest = pathname.slice(locale.length + 1).replace(/\/+$/, "");
			return { locale, path: rest || "/" };
		}
	}
	return { locale: DEFAULT_LOCALE, path: pathname };
}

/** The address of `path` in `locale`; English has no prefix, the others do. */
export function localizedPath(locale: Locale, path: string): string {
	const { path: plain } = splitLocale(path);
	if (locale === DEFAULT_LOCALE) return plain;
	return plain === "/" ? `/${locale}` : `/${locale}${plain}`;
}

/** The same page in every language, for `hreflang`. */
export function alternates(path: string): Record<Locale, string> {
	return Object.fromEntries(
		LOCALES.map((locale) => [locale, localizedPath(locale, path)])
	) as Record<Locale, string>;
}

/** Where the language switcher leads from `pathname`; `undefined` where there is no other language. */
export function switchPath(
	pathname: string,
	target: Locale
): string | undefined {
	const { path } = splitLocale(pathname);
	if (path === "/design-system" || path.startsWith("/design-system/"))
		return undefined;
	return localizedPath(target, path);
}
