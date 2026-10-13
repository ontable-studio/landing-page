import { SectionHeader } from "../../components/layout/SectionHeader";
import { colorGroups } from "./tokens.data";

export function ColorSection(): React.JSX.Element {
	return (
		<section id="colours" className="scroll-mt-36">
			<SectionHeader
				title="Colours"
				description="Orange is the brand; ink is the warm neutral. White on orange-500 is about 3.3:1, so keep labels on it semibold and 16px or larger."
			/>
			{colorGroups.map((group) => (
				<div key={group.name} className="mt-8">
					<h3 className="text-title mb-3 font-semibold">{group.name}</h3>
					<ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
						{group.swatches.map((swatch) => (
							<li key={swatch.token}>
								<div
									aria-hidden="true"
									className="border-surface-border h-16 rounded-2xl border"
									style={{ backgroundColor: swatch.hex }}
								/>
								<p className="text-body-sm mt-2 font-medium">{swatch.token}</p>
								<p className="text-caption text-text-secondary font-mono">
									{swatch.hex}
								</p>
							</li>
						))}
					</ul>
				</div>
			))}
		</section>
	);
}
