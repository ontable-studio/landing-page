import { SectionHeader } from "../../components/layout/SectionHeader";

export function SpacingSection(): React.JSX.Element {
	return (
		<section id="spacing" className="scroll-mt-36">
			<SectionHeader
				title="Spacing and radius"
				description="Sections use py-section (80px) and lg:py-section-lg (120px). Use rounded-2xl and rounded-3xl; pills are rounded-full."
			/>
			<div className="mt-8 flex flex-wrap items-end gap-6">
				<div>
					<div className="size-20 rounded-2xl bg-orange-100" />
					<p className="text-caption mt-2 font-mono">section 80px</p>
				</div>
				<div>
					<div className="size-30 rounded-2xl bg-orange-100" />
					<p className="text-caption mt-2 font-mono">section-lg 120px</p>
				</div>
				<div>
					<div className="size-20 rounded-3xl bg-orange-100" />
					<p className="text-caption mt-2 font-mono">rounded-3xl</p>
				</div>
				<div>
					<div className="h-10 w-24 rounded-full bg-orange-100" />
					<p className="text-caption mt-2 font-mono">rounded-full</p>
				</div>
			</div>
		</section>
	);
}
