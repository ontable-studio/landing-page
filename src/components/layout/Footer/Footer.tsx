import { SITE } from "../../../common/constants";
import { Container } from "../../ui/Container";

/** Site footer: studio name, tagline and social links. */
export function Footer(): React.JSX.Element {
	return (
		<footer className="border-surface-border border-t py-10">
			<Container className="flex flex-wrap items-center justify-between gap-6">
				<div>
					<p className="font-display text-title">{SITE.name}</p>
					<p className="text-body-sm text-text-secondary mt-1">
						{SITE.tagline}
					</p>
				</div>
				<ul className="flex gap-6">
					{SITE.social.map((s) => (
						<li key={s.label}>
							<a
								href={s.href}
								className="text-body-sm hover:text-brand font-medium"
							>
								{s.label}
							</a>
						</li>
					))}
				</ul>
			</Container>
		</footer>
	);
}
