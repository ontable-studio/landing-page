import { useSearchParams } from "react-router";
import { RouterLink } from "../components/layout/RouterLink";
import { SectionFrame } from "../components/layout/SectionFrame";
import { SectionHeader } from "../components/layout/SectionHeader";
import { ProjectCard } from "../components/ui/ProjectCard";
import { Reveal } from "../components/ui/Reveal";
import { Tabs, tabId } from "../components/ui/Tabs";
import { localizedProjects, typeLabel } from "../data/localize";
import { projectTypes } from "../data/projects";
import { useT } from "../i18n";
import { useSeo } from "../seo/useSeo";

const PANEL_ID = "projects-panel";

const slugOf = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

/** Every project, two per row, filtered by type with tabs. The type lives in `?type=`. */
export default function Projects(): React.JSX.Element {
	useSeo({ name: "projects" });
	const [params, setParams] = useSearchParams();
	const { locale, t, to } = useT();
	const projects = localizedProjects(locale);
	const tabs = [
		{ id: "all", label: t("projects.all") },
		...projectTypes.map((type) => ({
			id: slugOf(type),
			label: typeLabel(locale, type),
		})),
	];

	const active = tabs.find((tab) => tab.id === params.get("type"))?.id ?? "all";
	const visible =
		active === "all"
			? projects
			: projects.filter((project) => slugOf(project.type) === active);

	function choose(id: string) {
		const update = () =>
			setParams(id === "all" ? {} : { type: id }, {
				replace: true,
				flushSync: true,
			});
		// Where the browser can, animate the cards to their new places. A hidden page
		// cannot run a transition, so it just filters.
		if ("startViewTransition" in document && !document.hidden) {
			const transition = document.startViewTransition(update);
			// An aborted transition rejects these promises; the filter has applied anyway.
			transition.ready.catch(() => {});
			transition.finished.catch(() => {});
		} else {
			update();
		}
	}

	return (
		<SectionFrame
			surfaceClass="bg-cream"
			innerClassName="px-4 py-8 sm:px-6 lg:px-8 lg:py-12"
		>
			<div className="bg-parchment border-ink-300/80 relative overflow-hidden rounded-3xl border p-6 shadow-[4px_4px_0_0_rgba(23,21,19,0.1)] sm:p-8">
				<SectionHeader
					as="h1"
					eyebrow={t("projects.eyebrow")}
					title={t("projects.title")}
					description={t("projects.description")}
					action={
						<p className="text-caption border-ink-900/20 bg-cream text-ink-800 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono font-medium tabular-nums">
							<span
								aria-hidden="true"
								className="bg-brand size-2 rounded-full"
							/>
							{t("projects.count", {
								count: String(visible.length).padStart(2, "0"),
							})}
						</p>
					}
				/>
				<div
					aria-hidden="true"
					className="retro-stripes mt-6 h-2 w-full rounded-full opacity-75"
				/>
				<div className="mt-5">
					<Tabs
						items={tabs}
						value={active}
						onValueChange={choose}
						ariaLabel={t("projects.tabs")}
						panelId={PANEL_ID}
					/>
				</div>
			</div>
			<div
				role="tabpanel"
				id={PANEL_ID}
				aria-labelledby={tabId(PANEL_ID, active)}
				className="mt-8"
			>
				{visible.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2 lg:gap-8">
						{visible.map((project, index) => (
							<div
								key={project.slug}
								data-card=""
								style={{ viewTransitionName: project.slug }}
							>
								<Reveal delay={index * 0.06} className="h-full">
									<ProjectCard
										index={String(index + 1).padStart(2, "0")}
										title={project.title}
										category={project.category}
										summary={project.summary}
										year={project.year}
										status={project.status}
										headingLevel={2}
										loading={index < 2 ? "eager" : "lazy"}
										image={project.image}
										href={to(`/projects/${project.slug}`)}
										linkAs={RouterLink}
										className="h-full"
									/>
								</Reveal>
							</div>
						))}
					</div>
				) : (
					<p className="text-body-lg text-text-secondary">
						{t("projects.empty")}
					</p>
				)}
			</div>
		</SectionFrame>
	);
}
