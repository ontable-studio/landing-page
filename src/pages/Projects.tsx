import { useSearchParams } from "react-router";
import { RouterLink } from "../components/layout/RouterLink";
import { SectionHeader } from "../components/layout/SectionHeader";
import { Container } from "../components/ui/Container";
import { ProjectCard } from "../components/ui/ProjectCard";
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
		<Container size="wide" className="py-8 lg:py-12">
			<SectionHeader as="h1" title={t("projects.title")} />
			<Tabs
				className="mt-6"
				items={tabs}
				value={active}
				onValueChange={choose}
				ariaLabel={t("projects.tabs")}
				panelId={PANEL_ID}
			/>
			<div
				role="tabpanel"
				id={PANEL_ID}
				aria-labelledby={tabId(PANEL_ID, active)}
				className="mt-6"
			>
				{visible.length > 0 ? (
					<div className="grid gap-6 md:grid-cols-2">
						{visible.map((project, index) => (
							<div
								key={project.slug}
								data-card=""
								style={{ viewTransitionName: project.slug }}
							>
								<ProjectCard
									title={project.title}
									category={project.category}
									year={project.year}
									status={project.status}
									headingLevel={2}
									loading={index < 2 ? "eager" : "lazy"}
									image={project.image}
									href={to(`/projects/${project.slug}`)}
									linkAs={RouterLink}
								/>
							</div>
						))}
					</div>
				) : (
					<p className="text-body-lg text-text-secondary">
						{t("projects.empty")}
					</p>
				)}
			</div>
		</Container>
	);
}
