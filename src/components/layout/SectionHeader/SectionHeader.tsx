import { cn } from "../../../lib/cn";

interface SectionHeaderProps {
	eyebrow?: string;
	title: string;
	description?: string;
	/** Optional right-aligned action or metadata slot on larger screens. */
	action?: React.ReactNode;
	/** Heading level: `h1` for the first section of a page, `h2` otherwise. */
	as?: "h1" | "h2";
	className?: string;
}

/** Eyebrow, display title and description that open a section (clean typography, no decorative dash line). */
export function SectionHeader({
	eyebrow,
	title,
	description,
	action,
	as: Heading = "h2",
	className,
}: SectionHeaderProps): React.JSX.Element {
	return (
		<header
			className={cn(
				"flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				className
			)}
		>
			<div className="max-w-3xl">
				{eyebrow && (
					<p className="text-label text-brand-ink mb-2.5 font-mono font-medium tracking-[0.08em] uppercase">
						{eyebrow}
					</p>
				)}
				<Heading className="text-h2 font-display text-text-primary max-[720px]:text-h3">
					{title}
				</Heading>
				{description && (
					<p className="text-body-lg text-text-secondary mt-3 max-w-2xl">
						{description}
					</p>
				)}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</header>
	);
}
