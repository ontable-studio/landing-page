import { Link, useLocation } from "react-router";
import {
	LOCALES,
	LOCALE_LABEL,
	switchPath,
	useT,
	type Locale,
} from "../../../i18n";
import type { TextKey } from "../../../i18n";
import { cn } from "../../../lib/cn";

const NAMES: Record<Locale, TextKey> = {
	en: "nav.languageEnglish",
	id: "nav.languageIndonesian",
};

/** EN | ID: each links to the same page in that language, keeping the query string. */
export function LanguageSwitcher({
	className,
}: {
	className?: string;
}): React.JSX.Element | null {
	const { pathname, search } = useLocation();
	const { locale, t } = useT();
	if (switchPath(pathname, "en") === undefined) return null;

	return (
		<div
			role="group"
			aria-label={t("nav.language")}
			className={cn("flex items-center gap-1", className)}
		>
			{LOCALES.map((target) => {
				const current = target === locale;
				return (
					<Link
						key={target}
						to={`${switchPath(pathname, target)}${search}`}
						lang={target}
						hrefLang={target}
						aria-label={t(NAMES[target])}
						aria-current={current ? "true" : undefined}
						className={cn(
							"focus-visible:outline-brand hover:bg-surface focus-visible:bg-surface text-body-sm inline-flex h-9 items-center rounded-full px-3 font-mono font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2",
							current ? "bg-surface text-text-primary" : "text-text-secondary"
						)}
					>
						{LOCALE_LABEL[target]}
					</Link>
				);
			})}
		</div>
	);
}
