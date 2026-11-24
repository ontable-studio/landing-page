import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useParams } from "react-router";
import { SectionFrame } from "../components/layout/SectionFrame";
import { Badge } from "../components/ui/Badge";
import { buttonVariants } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Lightbox } from "../components/ui/Lightbox";
import { Reveal } from "../components/ui/Reveal";
import { localizeProject } from "../data/localize";
import { getProject, nextProject, type Project } from "../data/projects";
import { useT } from "../i18n";
import { cn } from "../lib/cn";
import { useSeo } from "../seo/useSeo";
import { usePointerGlow } from "../lib/usePointerGlow";
import NotFound from "./NotFound";

/** Runs `update` inside a view transition where the browser can; otherwise just runs it. */
function withTransition(update: () => void, done?: () => void) {
	if ("startViewTransition" in document && !document.hidden) {
		const transition = document.startViewTransition(() => flushSync(update));
		// An aborted transition rejects these; the update has applied anyway.
		transition.ready.catch(() => {});
		void transition.finished.catch(() => {}).then(() => done?.());
	} else {
		update();
		done?.();
	}
}

function ExpandIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className="size-4"
		>
			<path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
		</svg>
	);
}

function ArrowLeftIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4"
		>
			<path d="M12.5 8h-9M7 4.5 3.5 8 7 11.5" />
		</svg>
	);
}

function ArrowUpRightIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
		>
			<path d="M4 12 12 4M5.5 4H12v6.5" />
		</svg>
	);
}

/** One project's page. Exported so sparse data can be rendered directly in tests. */
export function ProjectView({
	project,
}: {
	project: Project;
}): React.JSX.Element {
	const { locale, t, to } = useT();
	useSeo({ name: "project", project });
	const heroRef = useRef<HTMLElement>(null);
	usePointerGlow(heroRef);
	const hasCredits = project.credits.length > 0;
	const nextEnglish = nextProject(project.slug);
	const next = nextEnglish && localizeProject(nextEnglish, locale);

	// Only pictures with a file can be previewed.
	const previewItems = project.gallery.flatMap((item) =>
		item.src ? [{ src: item.src, alt: item.alt }] : []
	);
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	// The thumbnail that carries the view transition name while a zoom is running.
	const [named, setNamed] = useState<number | null>(null);
	const thumbs = useRef<(HTMLButtonElement | null)[]>([]);

	function openPreview(index: number) {
		flushSync(() => setNamed(index));
		withTransition(() => {
			setOpenIndex(index);
			setNamed(null);
		});
	}

	function closePreview() {
		const index = openIndex;
		if (index === null) return;
		thumbs.current[index]?.scrollIntoView?.({ block: "center" });
		withTransition(
			() => {
				setNamed(index);
				setOpenIndex(null);
			},
			() => setNamed(null)
		);
	}

	let previewNumber = -1;

	return (
		<>
			<section
				ref={heroRef}
				data-hero=""
				className="bg-ink-900 relative h-[48svh] min-h-80 w-full overflow-hidden text-white lg:h-[56svh] lg:min-h-96"
			>
				{project.image ? (
					<img
						src={project.image}
						alt=""
						fetchPriority="high"
						decoding="async"
						className="animate-settle absolute inset-0 size-full scale-[1.08] object-cover"
						style={{
							translate:
								"calc(var(--nx, 0) * -14px) calc(var(--ny, 0) * -14px)",
						}}
					/>
				) : (
					<div
						aria-hidden="true"
						className="from-ink-700 to-ink-900 absolute inset-0 bg-linear-to-br"
					/>
				)}
				<div
					aria-hidden="true"
					className="crt-scanlines pointer-events-none absolute inset-0 opacity-16"
				/>
				<div
					aria-hidden="true"
					className="from-ink-900/90 via-ink-900/35 to-ink-900/20 absolute inset-0 bg-linear-to-t"
				/>
				<Container
					size="wide"
					className="relative flex h-full flex-col justify-between py-6 lg:py-8"
				>
					<Link
						to={to("/projects")}
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							"bg-ink-900 hover:bg-ink-800 before:bg-ink-800 self-start border-white/25 text-white shadow-md shadow-black/30 hover:border-white/40"
						)}
					>
						<ArrowLeftIcon />
						{t("project.back")}
					</Link>
					<div>
						<div className="flex flex-wrap items-center gap-2.5">
							<Badge
								variant="outline"
								className="bg-ink-900/70 border-white/35 text-white"
							>
								{project.category}
							</Badge>
							{project.status && (
								<Badge variant="brand" className="bg-brand-ink">
									{project.status}
								</Badge>
							)}
							{project.year !== undefined && (
								<span
									data-year=""
									className="text-body-sm font-mono font-medium text-white/90 tabular-nums"
								>
									{project.year}
								</span>
							)}
						</div>
						<h1 className="font-display mt-4 max-w-4xl text-[clamp(2.25rem,6vw,5rem)] leading-[0.98] font-bold tracking-tight wrap-break-word">
							<span className="mb-[-0.2em] block overflow-hidden pb-[0.2em]">
								<span data-line="" className="animate-line-rise block">
									{project.title}
								</span>
							</span>
						</h1>
					</div>
				</Container>
			</section>

			<SectionFrame
				surfaceClass="bg-cream"
				innerClassName="px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
				marksTop
			>
				<div
					data-body=""
					className={cn(
						"grid gap-8",
						hasCredits && "lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-14"
					)}
				>
					<div>
						<p className="text-body-lg/relaxed text-ink-700 max-w-prose">
							{project.summary}
						</p>
						{project.links && project.links.length > 0 && (
							<div className="mt-7 flex flex-wrap gap-3">
								{project.links.map((link) => (
									<a
										key={link.href}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className={cn(
											buttonVariants({ variant: "primary", size: "lg" })
										)}
									>
										{link.label}
										<ArrowUpRightIcon />
									</a>
								))}
							</div>
						)}
					</div>
					{hasCredits && (
						<Reveal delay={0.08}>
							<aside
								aria-label={t("project.specs")}
								className="border-ink-900/20 bg-parchment relative overflow-hidden rounded-2xl border shadow-[4px_4px_0_0_rgba(23,21,19,0.12)]"
							>
								<div className="bg-ink-900 flex items-center justify-between px-5 py-2.5 text-white">
									<span className="text-caption inline-flex items-center gap-2 font-mono font-medium tracking-[0.08em] text-amber-300 uppercase">
										<span
											aria-hidden="true"
											className="bg-brand size-1.5 rounded-full"
										/>
										{t("project.specHeader")}
									</span>
								</div>
								<dl className="divide-ink-300/70 divide-y p-6">
									{project.credits.map((credit) => (
										<div
											key={credit.label}
											className="py-3.5 first:pt-0 last:pb-0"
										>
											<dt className="text-body-sm text-text-secondary font-mono">
												{credit.label}
											</dt>
											<dd className="text-body text-text-primary mt-1 font-medium">
												{credit.value}
											</dd>
										</div>
									))}
								</dl>
							</aside>
						</Reveal>
					)}
				</div>

				{project.gallery.length > 0 && (
					<div className="mt-14 lg:mt-16">
						<div className="border-ink-200/80 mb-6 flex items-baseline justify-between border-b pb-4">
							<h2 className="font-display text-h3 text-text-primary">
								{t("project.galleryTitle")}
							</h2>
							<span className="text-caption text-ink-500 font-mono tabular-nums">
								{t("project.frames", {
									count: String(project.gallery.length).padStart(2, "0"),
								})}
							</span>
						</div>

						<div data-gallery="" className="grid gap-6 sm:grid-cols-2">
							{project.gallery.map((item, index) => {
								const span = index === 0 ? "sm:col-span-2" : "";
								if (!item.src) {
									return (
										<div
											key={index}
											aria-hidden="true"
											className={cn(
												"from-ink-100 to-ink-200 aspect-16/10 rounded-2xl bg-linear-to-br",
												span
											)}
										/>
									);
								}
								previewNumber += 1;
								const number = previewNumber;
								return (
									<button
										key={index}
										ref={(node) => {
											thumbs.current[number] = node;
										}}
										type="button"
										aria-label={t("project.viewLarger", { alt: item.alt })}
										onClick={() => openPreview(number)}
										className={cn(
											"group border-ink-300/80 bg-parchment hover:border-ink-900/40 focus-visible:outline-brand relative flex cursor-zoom-in flex-col overflow-hidden rounded-2xl border p-2 text-left shadow-[0_3px_0_0_rgba(23,21,19,0.08)] transition-[border-color,box-shadow] duration-200 hover:shadow-[4px_4px_0_0_rgba(23,21,19,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2",
											span
										)}
									>
										<div className="bg-ink-900 relative overflow-hidden rounded-xl">
											<img
												src={item.src}
												alt=""
												loading="lazy"
												decoding="async"
												className="aspect-16/10 w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
												style={{
													viewTransitionName:
														named === number ? "preview" : undefined,
												}}
											/>
											<div
												aria-hidden="true"
												className="crt-scanlines pointer-events-none absolute inset-0 opacity-14"
											/>
											<span
												data-expand=""
												aria-hidden="true"
												className="bg-ink-900/90 absolute top-3 right-3 grid size-9 place-items-center rounded-full text-white opacity-0 shadow-md shadow-black/25 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
											>
												<ExpandIcon />
											</span>
										</div>
										<span
											aria-hidden="true"
											className="mt-2.5 flex items-baseline gap-2.5 px-1.5 pb-1"
										>
											<span className="text-caption text-brand-ink shrink-0 font-mono font-medium tabular-nums">
												REC {String(index + 1).padStart(2, "0")}
											</span>
											<span className="text-body-sm text-text-secondary line-clamp-1">
												{item.alt}
											</span>
										</span>
									</button>
								);
							})}
						</div>
					</div>
				)}

				{next && (
					<Reveal>
						<section
							data-next=""
							aria-labelledby="next-project"
							className="border-ink-200/80 mt-16 border-t pt-12 lg:mt-20"
						>
							<div className="mb-5 flex items-baseline justify-between gap-4">
								<div>
									<p className="text-label text-brand-ink mb-2 font-mono font-medium tracking-[0.08em] uppercase">
										{t("project.nextEyebrow")}
									</p>
									<h2 id="next-project" className="text-h3 font-display">
										{t("project.next")}
									</h2>
								</div>
							</div>

							<Link
								to={to(`/projects/${next.slug}`)}
								className="group border-ink-300/80 bg-parchment hover:border-ink-900/40 focus-visible:outline-brand grid items-center gap-6 rounded-3xl border p-3 shadow-[0_3px_0_0_rgba(23,21,19,0.08)] transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_rgba(23,21,19,0.22),4px_4px_0_0_rgba(23,21,19,0.16)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:grid-cols-[17rem_1fr] lg:grid-cols-[22rem_1fr] lg:gap-8"
							>
								<div className="relative">
									{next.year !== undefined ? (
										<span className="text-caption text-ink-600 absolute top-2 right-3.5 z-10 font-mono font-medium tabular-nums">
											{next.year}
										</span>
									) : next.status ? (
										<span
											aria-hidden="true"
											className="text-label text-brand-ink absolute top-2 right-3.5 z-10 inline-flex items-center gap-1 font-mono font-medium uppercase"
										>
											<span className="bg-brand-ink size-1.5 rounded-full" />
											{t("card.inProgressShort")}
										</span>
									) : null}
									<div className="cut-corner bg-ink-900 aspect-16/10 overflow-hidden rounded-2xl">
										{next.image ? (
											<img
												src={next.image}
												alt={next.title}
												loading="lazy"
												decoding="async"
												className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
											/>
										) : (
											<div
												aria-hidden="true"
												className="from-ink-700 to-ink-900 size-full bg-linear-to-br"
											/>
										)}
									</div>
								</div>

								<div className="flex items-center justify-between gap-4 px-2 pb-2 sm:py-2 sm:pr-4">
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<Badge variant="outline">{next.category}</Badge>
											{next.status && (
												<Badge variant="brand" className="bg-brand-ink">
													{next.status}
												</Badge>
											)}
										</div>
										<h3 className="font-display text-h3 text-text-primary group-hover:text-brand-ink mt-3 transition-colors">
											{next.title}
										</h3>
										<p className="text-body-sm text-text-secondary mt-2 line-clamp-2 max-w-2xl">
											{next.summary}
										</p>
									</div>
									<span
										aria-hidden="true"
										className="border-ink-200 bg-canvas text-ink-700 group-hover:border-ink-900 group-hover:bg-ink-900 grid size-11 shrink-0 place-items-center rounded-full border transition-colors group-hover:text-white"
									>
										<ArrowUpRightIcon />
									</span>
								</div>
							</Link>
						</section>
					</Reveal>
				)}
			</SectionFrame>

			<Lightbox
				items={previewItems}
				index={openIndex}
				onIndexChange={setOpenIndex}
				onClose={closePreview}
			/>
		</>
	);
}

/** One project, looked up by the `:slug` in the address. */
export default function ProjectDetail(): React.JSX.Element {
	const { slug = "" } = useParams();
	const project = getProject(slug);
	const { locale } = useT();
	return project ? (
		<ProjectView project={localizeProject(project, locale)} />
	) : (
		<NotFound />
	);
}
