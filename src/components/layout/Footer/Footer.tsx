import { tagline as taglineOf, useT } from "../../../i18n";
import { SITE } from "../../../common/constants";
import { cn } from "../../../lib/cn";
import { SocialChips } from "../../ui/SocialChips";
import { useCrt } from "../CrtShader";
import { SectionFrame } from "../SectionFrame";

interface FooterProps {
	/** `bar`: full footer with tagline & continuous page rails. `overlay`: slim row. */
	variant?: "bar" | "overlay";
}

/** Site footer: warm parchment continuous-rail container with studio info, CRT toggle & socials. */
export function Footer({ variant = "bar" }: FooterProps): React.JSX.Element {
	const { locale, t } = useT();
	const { enabled: crtOn, toggle: toggleCrt } = useCrt();
	const tagline = taglineOf(locale);

	if (variant === "overlay") {
		return (
			<footer className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4 lg:px-10 lg:py-6">
				<p className="text-body-sm text-ink-700 font-medium">{SITE.name}</p>
				<SocialChips links={SITE.social} />
			</footer>
		);
	}

	return (
		<footer className="border-ink-900/15 border-t">
			<SectionFrame
				surfaceClass="bg-parchment"
				innerClassName="flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8 lg:py-12"
				marksTop
			>
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2.5">
						<img
							src="/images/ontable-logo.svg"
							alt=""
							aria-hidden="true"
							className="size-7 rounded-lg"
						/>
						<p className="font-display text-title font-bold">{SITE.name}</p>
					</div>
					<p className="text-body-sm text-text-secondary">{tagline}</p>
					<div className="mt-1 flex flex-wrap items-center gap-3">
						<a
							href={`mailto:${SITE.email}`}
							className="focus-visible:outline-brand text-caption text-ink-700 hover:text-brand-ink font-mono transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
						>
							{SITE.email}
						</a>
						<span aria-hidden="true" className="text-ink-300">
							·
						</span>
						<button
							type="button"
							aria-label={t("crt.toggle")}
							aria-pressed={crtOn}
							onClick={toggleCrt}
							className={cn(
								"focus-visible:outline-brand text-caption inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
								crtOn
									? "border-ink-900 bg-ink-900 text-amber-300"
									: "border-ink-300 bg-cream text-ink-600 hover:border-ink-400"
							)}
						>
							<span
								aria-hidden="true"
								className={cn(
									"size-1.5 rounded-full",
									crtOn ? "bg-brand" : "bg-ink-400"
								)}
							/>
							{crtOn ? t("crt.on") : t("crt.off")}
						</button>
					</div>
				</div>
				<SocialChips links={SITE.social} />
			</SectionFrame>
		</footer>
	);
}
