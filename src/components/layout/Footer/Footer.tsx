import { tagline as taglineOf, useT } from "../../../i18n";
import { SITE } from "../../../common/constants";
import { Container } from "../../ui/Container";
import { SocialChips } from "../../ui/SocialChips";

interface FooterProps {
	/** `bar`: full footer with the tagline. `overlay`: slim row inside a full-screen section. */
	variant?: "bar" | "overlay";
}

/** Site footer: studio name and social links, plus the tagline in the full bar. */
export function Footer({ variant = "bar" }: FooterProps): React.JSX.Element {
	const { locale } = useT();
	const tagline = taglineOf(locale);
	if (variant === "overlay") {
		return (
			<footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-6 lg:px-10">
				<p className="text-body-sm font-medium">{SITE.name}</p>
				<SocialChips links={SITE.social} />
			</footer>
		);
	}

	return (
		<footer className="border-surface-border border-t py-10">
			<Container
				size="wide"
				className="flex flex-wrap items-center justify-between gap-6"
			>
				<div>
					<p className="font-display text-title">{SITE.name}</p>
					<p className="text-body-sm text-text-secondary mt-1">{tagline}</p>
				</div>
				<SocialChips links={SITE.social} />
			</Container>
		</footer>
	);
}
