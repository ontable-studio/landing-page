import { useT } from "../../../i18n";

/** Visually hidden skip link revealed on keyboard focus to jump straight to `#main-content`. */
export function SkipLink(): React.JSX.Element {
	const { t } = useT();
	return (
		<a
			href="#main-content"
			className="bg-ink-900 focus-visible:outline-brand text-body-sm sr-only rounded-full px-5 py-2.5 font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus-visible:outline-2 focus-visible:outline-offset-2"
		>
			{t("a11y.skipToContent")}
		</a>
	);
}
