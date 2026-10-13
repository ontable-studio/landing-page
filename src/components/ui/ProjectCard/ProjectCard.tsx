import { cn } from "../../../lib/cn";
import { Badge } from "../Badge";

interface ProjectCardProps {
	title: string;
	category: string;
	year: number | string;
	image?: string;
	imageAlt?: string;
	/** Makes the whole card a link. */
	href?: string;
	className?: string;
}

/** A framed project tile: picture with a cut corner holding the year. */
export function ProjectCard({
	title,
	category,
	year,
	image,
	imageAlt,
	href,
	className,
}: ProjectCardProps): React.JSX.Element {
	const classes = cn(
		"group border-surface-border bg-surface relative block rounded-3xl border p-2",
		className
	);
	const content = (
		<>
			<span className="text-body-sm text-text-secondary absolute top-4 right-5 font-mono">
				{year}
			</span>
			<div className="cut-corner bg-ink-900 relative aspect-16/10 overflow-hidden rounded-2xl">
				{image ? (
					<img
						src={image}
						alt={imageAlt ?? title}
						className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div
						aria-hidden="true"
						className="from-ink-700 to-ink-900 size-full bg-linear-to-br"
					/>
				)}
				<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-5 pt-16">
					<h3 className="text-h4 font-display line-clamp-2 text-white">
						{title}
					</h3>
					<Badge variant="outline" className="mt-2 border-white/40 text-white">
						{category}
					</Badge>
				</div>
			</div>
		</>
	);

	return href ? (
		<a href={href} className={classes}>
			{content}
		</a>
	) : (
		<div className={classes}>{content}</div>
	);
}
