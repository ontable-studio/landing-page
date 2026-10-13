import { cn } from "../../../lib/cn";

interface SectionHeaderProps {
	eyebrow?: string;
	title: string;
	description?: string;
	/** Heading level: `h1` for the first section of a page, `h2` otherwise. */
	as?: "h1" | "h2";
	className?: string;
}

/** Eyebrow, display title and description that open a section. */
export function SectionHeader({
	eyebrow,
	title,
	description,
	as: Heading = "h2",
	className,
}: SectionHeaderProps): React.JSX.Element {
	return (
		<header className={cn("max-w-3xl", className)}>
			{eyebrow && (
				<p className="text-label text-brand mb-3 font-mono font-medium tracking-wide uppercase">
					{eyebrow}
				</p>
			)}
			<Heading className="text-h2 font-display text-text-primary max-[720px]:text-h3">
				{title}
			</Heading>
			{description && (
				<p className="text-body-lg text-text-secondary mt-4">{description}</p>
			)}
		</header>
	);
}
