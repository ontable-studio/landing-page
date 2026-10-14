import { Container } from "../components/ui/Container";
import { useSeo } from "../seo/useSeo";
import { SectionHeader } from "../components/layout/SectionHeader";
import { ColorSection } from "./design-system/ColorSection";
import { ComponentsSection } from "./design-system/ComponentsSection";
import { MotionSection } from "./design-system/MotionSection";
import { SpacingSection } from "./design-system/SpacingSection";
import { TypographySection } from "./design-system/TypographySection";

const SECTIONS = [
	{ id: "colours", label: "Colours" },
	{ id: "typography", label: "Typography" },
	{ id: "spacing", label: "Spacing" },
	{ id: "motion", label: "Motion" },
	{ id: "components", label: "Components" },
];

/** Living style guide: every token and component, rendered for real. */
export default function DesignSystem(): React.JSX.Element {
	useSeo({ name: "design-system" });

	return (
		<Container size="wide" className="py-section lg:py-section-lg">
			<SectionHeader
				as="h1"
				eyebrow="OnTable Studio"
				title="Design System"
				description="Tokens and components for the OnTable site."
			/>
			<nav
				aria-label="Sections"
				className="bg-canvas border-surface-border sticky top-0 z-40 -mx-4 mt-8 flex gap-6 overflow-x-auto border-y px-4 py-3 lg:-mx-8 lg:px-8"
			>
				{SECTIONS.map((section) => (
					<a
						key={section.id}
						href={`#${section.id}`}
						className="text-body-sm hover:text-brand font-medium whitespace-nowrap"
					>
						{section.label}
					</a>
				))}
			</nav>
			<div className="mt-12 flex flex-col gap-20">
				<ColorSection />
				<TypographySection />
				<SpacingSection />
				<MotionSection />
				<ComponentsSection />
			</div>
		</Container>
	);
}
