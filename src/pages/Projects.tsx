import { RouterLink } from "../components/layout/RouterLink";
import { SectionHeader } from "../components/layout/SectionHeader";
import { Container } from "../components/ui/Container";
import { ProjectCard } from "../components/ui/ProjectCard";
import { projects } from "../data/projects";
import { useDocumentTitle } from "../lib/useDocumentTitle";

/** Every project, stacked full width. */
export default function Projects(): React.JSX.Element {
	useDocumentTitle("Projects — OnTable");

	return (
		<Container className="py-section lg:py-section-lg">
			<SectionHeader as="h1" eyebrow="Our work" title="Projects" />
			<div className="mt-12 flex flex-col gap-8">
				{projects.map((project) => (
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
		</Container>
	);
}
