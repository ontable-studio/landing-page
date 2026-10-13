import { Container } from "../components/ui/Container";
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
	return (
		<Container className="py-section lg:py-section-lg">
			<SectionHeader
				as="h1"
				eyebrow="OnTable Studio"
				title="Design System"
				description="Tokens and components for the OnTable site."
			/>
			<nav
				aria-label="Sections"
				className="bg-canvas/90 border-surface-border sticky top-16 z-40 -mx-6 mt-8 flex gap-6 overflow-x-auto border-y px-6 py-3 backdrop-blur"
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
