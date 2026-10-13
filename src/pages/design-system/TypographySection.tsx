import { SectionHeader } from "../../components/layout/SectionHeader";
import { typeScale } from "./tokens.data";

export function TypographySection(): React.JSX.Element {
	return (
		<section id="typography" className="scroll-mt-36">
			<SectionHeader
				title="Typography"
				description="Poppins Bold for display and headings only; Instrument Sans for body and UI; IBM Plex Mono for small labels."
			/>
			<ul className="mt-8 divide-y divide-(--color-surface-border)">
				{typeScale.map((step) => (
					<li
						key={step.token}
						data-testid={`type-${step.token}`}
						className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]"
					>
						<p className="text-caption text-text-secondary font-mono">
							{step.token} · {step.size}
						</p>
						<p className={step.className}>{step.sample}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
