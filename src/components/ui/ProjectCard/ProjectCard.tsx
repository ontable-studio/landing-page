import { useRef } from "react";
import { cn } from "../../../lib/cn";
import { usePointerGlow } from "../../../lib/usePointerGlow";
import { Badge } from "../Badge";

interface ProjectCardProps {
	title: string;
	category: string;
	/** Shown in the cut corner; the tab is left out until the year is known. */
	year?: number | string;
	image?: string;
	imageAlt?: string;
	/** A pill beside the category, for example "In development". */
	status?: string;
	/** Heading level of the title: 2 under a page `h1`, 3 under a section heading. */
	headingLevel?: 2 | 3;
	/** Makes the whole card a link. */
	href?: string;
	/** Component used for the link (default `a`), e.g. a router link. */
	linkAs?: React.ElementType;
	className?: string;
}

/**
 * A framed project tile: picture with a cut corner holding the year. A linked
 * card lifts on hover and focus, and shows a "View" chip that follows the pointer.
 */
export function ProjectCard({
	title,
	category,
	year,
	image,
	imageAlt,
	status,
	headingLevel = 3,
	href,
	linkAs: LinkComponent = "a",
	className,
}: ProjectCardProps): React.JSX.Element {
	const Heading = headingLevel === 2 ? "h2" : "h3";
	const pictureRef = useRef<HTMLDivElement>(null);
	usePointerGlow(pictureRef);

	const classes = cn(
		"group border-surface-border bg-surface relative block rounded-3xl border p-2",
		href &&
			"transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 focus-visible:-translate-y-1 focus-visible:shadow-xl focus-visible:shadow-black/10",
		className
	);
	const content = (
		<>
			{year !== undefined && (
				<span
					data-year=""
					className="text-body-sm text-text-secondary absolute top-4 right-5 font-mono"
				>
					{year}
				</span>
			)}
			<div
				ref={pictureRef}
				className="cut-corner bg-ink-900 relative aspect-16/10 overflow-hidden rounded-2xl"
			>
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
					<Heading className="text-h4 font-display line-clamp-2 text-white">
						{title}
					</Heading>
					<div className="mt-2 flex flex-wrap gap-2">
						<Badge variant="outline" className="border-white/40 text-white">
							{category}
						</Badge>
						{status && <Badge variant="brand">{status}</Badge>}
					</div>
				</div>
				{href && (
					<span
						data-chip=""
						aria-hidden="true"
						className="text-body-sm bg-canvas text-text-primary pointer-events-none absolute top-0 left-0 z-10 rounded-full px-4 py-2 font-medium transition-opacity duration-200"
						style={{
							translate:
								"calc(var(--gx, 50%) + 14px) calc(var(--gy, 50%) + 14px)",
							opacity: "var(--glow-on, 0)",
						}}
					>
						View
					</span>
				)}
			</div>
		</>
	);

	return href ? (
		<LinkComponent href={href} className={classes}>
			{content}
		</LinkComponent>
	) : (
		<div className={classes}>{content}</div>
	);
}
