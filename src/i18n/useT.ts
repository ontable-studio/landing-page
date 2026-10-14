import { useContext, useMemo } from "react";
import { UNSAFE_LocationContext } from "react-router";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import { localizedPath, splitLocale } from "./paths";
import { translate, type TextKey, type TextVars } from "./translate";

/** The language of the page being shown, read from the address (English outside a router). */
export function useLocale(): Locale {
	const location = useContext(UNSAFE_LocationContext)?.location;
	return location ? splitLocale(location.pathname).locale : DEFAULT_LOCALE;
}

/**
 * The current language with its tools: `t(key, vars)` for a text and `to(path)` to make an
 * internal address stay in the same language.
 */
export function useT() {
	const locale = useLocale();
	return useMemo(
		() => ({
			locale,
			t: (key: TextKey, vars?: TextVars) => translate(locale, key, vars),
			to: (path: string) => localizedPath(locale, path),
		}),
		[locale]
	);
}
