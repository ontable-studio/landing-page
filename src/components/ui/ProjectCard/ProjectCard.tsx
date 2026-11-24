import { useRef } from "react";
import { useT } from "../../../i18n";
import { cn } from "../../../lib/cn";
import { usePointerGlow } from "../../../lib/usePointerGlow";
import { Badge } from "../Badge";

interface ProjectCardProps {
	title: string;
	category: string;
	/** Optional short pitch shown under the title in the cardstock footer. */
	summary?: string;
	/** Optional editorial index (e.g. "01"). */
	index?: string;
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
	/** `eager` for cards in the first screen; the rest load as they near the viewport. */
	loading?: "eager" | "lazy";
	className?: string;
}

function CardArrow(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
		>
			<path d="M4 12 12 4M5.5 4H12v6.5" />
		</svg>
	);
}

/**
 * A framed tactile project card: clean full-bleed artwork with a chamfered corner
 * notch for the year (or WIP indicator), paired with a warm cardstock footer below
 * so typography never collides with game title art.
 */
export function ProjectCard({
	title,
	category,
	summary,
	index,
	year,
	image,
	imageAlt,
	status,
	headingLevel = 3,
	href,
	linkAs: LinkComponent = "a",
	loading = "lazy",
	className,
}: ProjectCardProps): React.JSX.Element {
	const { t } = useT();
	const Heading = headingLevel === 2 ? "h2" : "h3";
	const pictureRef = useRef<HTMLDivElement>(null);
	usePointerGlow(pictureRef);

	const classes = cn(
		"group border-ink-300/80 bg-parchment relative flex flex-col rounded-3xl border p-2.5 shadow-[0_3px_0_0_rgba(23,21,19,0.09)]",
		href &&
			"focus-visible:outline-brand hover:border-ink-900/40 focus-visible:border-ink-900/40 transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_rgba(23,21,19,0.22),4px_4px_0_0_rgba(23,21,19,0.16)] focus-visible:-translate-y-1 focus-visible:shadow-[0_14px_30px_-14px_rgba(23,21,19,0.22),4px_4px_0_0_rgba(23,21,19,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2",
		className
	);

	const content = (
		<>
			{year !== undefined ? (
				<span
					data-year=""
					className="text-body-sm text-ink-600 group-hover:text-brand-ink absolute top-4 right-5 font-mono font-medium tabular-nums transition-colors duration-200"
				>
					{year}
				</span>
			) : status ? (
				<span
					data-status-corner=""
					aria-hidden="true"
					className="text-label text-brand-ink absolute top-4 right-5 inline-flex items-center gap-1.5 font-mono font-medium tracking-wider uppercase"
				>
					<span className="bg-brand-ink size-1.5 rounded-full" />
					{t("card.inProgressShort")}
				</span>
			) : null}

			<div
				ref={pictureRef}
				className="cut-corner bg-ink-900 ring-ink-900/6 relative aspect-16/10 overflow-hidden rounded-2xl ring-1 ring-inset"
			>
				{image ? (
					<img
						src={image}
						alt={imageAlt ?? title}
						loading={loading}
						decoding="async"
						className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
					/>
				) : (
					<div
						aria-hidden="true"
						className="from-ink-700 to-ink-900 size-full bg-linear-to-br"
					/>
				)}
				{/* Subtle CRT monitor scanline & curved-glass glare over game screen */}
				<div
					aria-hidden="true"
					className="crt-scanlines pointer-events-none absolute inset-0 opacity-30"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.28)]"
					style={{
						backgroundImage:
							"linear-gradient(135deg, rgb(255 255 255 / 0.08) 0%, transparent 40%)",
					}}
				/>

				{href && (
					<span
						data-chip=""
						aria-hidden="true"
						className="text-body-sm bg-ink-900 pointer-events-none absolute top-0 left-0 z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium text-white shadow-md shadow-black/20 transition-opacity duration-200"
						style={{
							translate:
								"calc(var(--gx, 50%) + 14px) calc(var(--gy, 50%) + 14px)",
							opacity: "var(--glow-on, 0)",
						}}
					>
						{t("card.view")}
					</span>
				)}
			</div>

			<div className="flex flex-1 flex-col justify-between gap-3 px-2.5 pt-4 pb-2">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						{index && (
							<span className="text-caption text-ink-400 mb-1 block font-mono tabular-nums">
								{index}
							</span>
						)}
						<Heading className="text-h4 font-display text-text-primary group-hover:text-brand-ink line-clamp-2 transition-colors duration-200">
							{title}
						</Heading>
						{summary && (
							<p className="text-body-sm text-text-secondary mt-1.5 line-clamp-2">
								{summary}
							</p>
						)}
					</div>
					{href && (
						<span
							aria-hidden="true"
							className="border-ink-200 bg-canvas text-ink-700 group-hover:border-ink-900 group-hover:bg-ink-900 group-focus-visible:border-ink-900 group-focus-visible:bg-ink-900 mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
						>
							<CardArrow />
						</span>
					)}
				</div>

				<div className="flex flex-wrap items-center gap-2 pt-1">
					<Badge variant="outline">{category}</Badge>
					{status && (
						<Badge variant="brand" className="bg-brand-ink">
							{status}
						</Badge>
					)}
				</div>
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
