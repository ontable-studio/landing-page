import { Accordion } from "../../components/ui/Accordion";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProjectCard } from "../../components/ui/ProjectCard";
import { SectionHeader } from "../../components/layout/SectionHeader";

const buttonVariants = ["primary", "outline", "ghost", "link"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;
const cardVariants = ["flat", "bordered", "elevated"] as const;

export function ComponentsSection(): React.JSX.Element {
	return (
		<section id="components" className="scroll-mt-36">
			<SectionHeader title="Components" />

			<h3 className="text-title mt-8 mb-3 font-semibold">Button</h3>
			<div className="flex flex-col gap-4">
				{buttonVariants.map((variant) => (
					<div key={variant} className="flex flex-wrap items-center gap-3">
						{buttonSizes.map((size) => (
							<Button
								key={size}
								variant={variant}
								size={size}
								arrow={size === "lg"}
								data-testid={size === "md" ? `button-${variant}` : undefined}
							>
								{variant} {size}
							</Button>
						))}
					</div>
				))}
			</div>

			<h3 className="text-title mt-8 mb-3 font-semibold">Badge</h3>
			<div className="flex gap-3">
				<Badge variant="brand">Brand</Badge>
				<Badge variant="neutral">Neutral</Badge>
				<Badge variant="outline">Outline</Badge>
			</div>

			<h3 className="text-title mt-8 mb-3 font-semibold">Card</h3>
			<div className="grid gap-4 sm:grid-cols-3">
				{cardVariants.map((variant) => (
					<Card key={variant} variant={variant} className="p-6">
						{variant}
					</Card>
				))}
			</div>

			<h3 className="text-title mt-8 mb-3 font-semibold">ProjectCard</h3>
			<div className="grid gap-6 sm:grid-cols-2">
				<ProjectCard
					index="01"
					title="Without an image"
					category="Prototype"
					summary="A tactile cardstock tile showing the fallback frame and clean metadata footer."
					status="In development"
				/>
				<ProjectCard
					index="02"
					title="A very long project title that wraps onto a second line and then gets clamped"
					category="PC"
					summary="Linked cards lift cleanly on hover and focus with a directional arrow cue."
					year={2025}
					href="#components"
				/>
			</div>

			<h3 className="text-title mt-8 mb-3 font-semibold">Accordion</h3>
			<Accordion
				defaultOpenId="ds-1"
				items={[
					{
						id: "ds-1",
						question: "How does keyboard navigation work?",
						answer:
							"Use ArrowUp, ArrowDown, Home, and End to move focus between triggers, and Enter or Space to expand or collapse.",
					},
					{
						id: "ds-2",
						question: "Can multiple items stay open at once?",
						answer:
							"Pass allowMultiple to let visitors keep several disclosure panels open simultaneously.",
					},
				]}
			/>
		</section>
	);
}
