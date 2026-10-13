import { useSearchParams } from "react-router";
import { RouterLink } from "../components/layout/RouterLink";
import { SectionHeader } from "../components/layout/SectionHeader";
import { Container } from "../components/ui/Container";
import { ProjectCard } from "../components/ui/ProjectCard";
import { Tabs, tabId } from "../components/ui/Tabs";
import { projectTypes, projects } from "../data/projects";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const PANEL_ID = "projects-panel";

const slugOf = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

const tabs = [
	{ id: "all", label: "All" },
	...projectTypes.map((type) => ({ id: slugOf(type), label: type })),
];

/** Every project, two per row, filtered by type with tabs. The type lives in `?type=`. */
export default function Projects(): React.JSX.Element {
	useDocumentTitle("Projects — OnTable");
	const [params, setParams] = useSearchParams();

	const active = tabs.find((tab) => tab.id === params.get("type"))?.id ?? "all";
	const visible =
		active === "all"
			? projects
			: projects.filter((project) => slugOf(project.type) === active);

	function choose(id: string) {
		setParams(id === "all" ? {} : { type: id }, { replace: true });
	}

	return (
		<Container size="wide" className="py-8 lg:py-12">
			<SectionHeader as="h1" title="Projects" />
			<Tabs
				className="mt-6"
				items={tabs}
				value={active}
				onValueChange={choose}
				ariaLabel="Project types"
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
						{visible.map((project) => (
							<ProjectCard
								key={project.slug}
								title={project.title}
								category={project.category}
								year={project.year}
								image={project.image}
								href={`/projects/${project.slug}`}
								linkAs={RouterLink}
							/>
						))}
					</div>
				) : (
					<p className="text-body-lg text-text-secondary">No projects yet.</p>
				)}
			</div>
		</Container>
	);
}
