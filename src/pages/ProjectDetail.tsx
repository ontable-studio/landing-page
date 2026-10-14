import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useParams } from "react-router";
import { RouterLink } from "../components/layout/RouterLink";
import { Badge } from "../components/ui/Badge";
import { buttonVariants } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Lightbox } from "../components/ui/Lightbox";
import { ProjectCard } from "../components/ui/ProjectCard";
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
				className="bg-ink-900 relative h-[70svh] min-h-96 w-full overflow-hidden text-white"
			>
				{project.image ? (
					<img
						src={project.image}
						alt=""
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
					className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
				/>
				<Container
					size="wide"
					className="relative flex h-full flex-col justify-between py-6 lg:py-8"
				>
					<Link
						to={to("/projects")}
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							"self-start border-white/50 bg-white/10 text-white hover:bg-white/20"
						)}
					>
						{t("project.back")}
					</Link>
					<div>
						<div className="flex items-center gap-3">
							<Badge variant="outline" className="border-white/50 text-white">
								{project.category}
							</Badge>
							{project.status && (
								<Badge variant="brand">{project.status}</Badge>
							)}
							{project.year !== undefined && (
								<span data-year="" className="text-body-sm text-white/80">
									{project.year}
								</span>
							)}
						</div>
						<h1 className="font-display mt-4 max-w-4xl text-[clamp(2rem,6vw,5rem)] leading-none font-bold wrap-break-word">
							<span className="mb-[-0.2em] block overflow-hidden pb-[0.2em]">
								<span data-line="" className="animate-line-rise block">
									{project.title}
								</span>
							</span>
						</h1>
					</div>
				</Container>
			</section>

			<Container size="wide" className="py-8 lg:py-12">
				<div
					data-body=""
					className={cn(
						"grid gap-8",
						hasCredits && "lg:grid-cols-[1fr_20rem] lg:gap-16"
					)}
				>
					<div>
						<p className="text-body-lg text-text-secondary max-w-prose">
							{project.summary}
						</p>
						{project.links && project.links.length > 0 && (
							<div className="mt-6 flex flex-wrap gap-3">
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
									</a>
								))}
							</div>
						)}
					</div>
					{hasCredits && (
						<dl className="grid gap-5 self-start">
							{project.credits.map((credit) => (
								<div key={credit.label}>
									<dt className="text-body-sm text-text-secondary">
										{credit.label}
									</dt>
									<dd className="text-body mt-1 font-medium">{credit.value}</dd>
								</div>
							))}
						</dl>
					)}
				</div>

				{project.gallery.length > 0 && (
					<div data-gallery="" className="mt-10 grid gap-6 sm:grid-cols-2">
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
										"group focus-visible:outline-brand relative block cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2",
										span
									)}
								>
									<img
										src={item.src}
										alt=""
										className="aspect-16/10 w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
										style={{
											viewTransitionName:
												named === number ? "preview" : undefined,
										}}
									/>
									<span
										data-expand=""
										aria-hidden="true"
										className="bg-canvas text-text-primary absolute top-3 right-3 grid size-9 place-items-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
									>
										<ExpandIcon />
									</span>
								</button>
							);
						})}
					</div>
				)}

				{next && (
					<section
						data-next=""
						aria-labelledby="next-project"
						className="mt-16 max-w-2xl"
					>
						<h2 id="next-project" className="text-h3 font-display mb-6">
							{t("project.next")}
						</h2>
						<ProjectCard
							title={next.title}
							category={next.category}
							year={next.year}
							status={next.status}
							image={next.image}
							href={to(`/projects/${next.slug}`)}
							linkAs={RouterLink}
						/>
					</section>
				)}
			</Container>

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
