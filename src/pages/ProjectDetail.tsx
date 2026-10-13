import { Link, useParams } from "react-router";
import { Badge } from "../components/ui/Badge";
import { buttonVariants } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { getProject, type Project } from "../data/projects";
import { cn } from "../lib/cn";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import NotFound from "./NotFound";

function ProjectView({ project }: { project: Project }): React.JSX.Element {
	useDocumentTitle(`${project.title} — OnTable`);

	return (
		<Container className="py-section lg:py-section-lg">
			<Link
				to="/projects"
				className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
			>
				Back
			</Link>

			<div className="bg-ink-900 relative mt-8 aspect-video overflow-hidden rounded-3xl">
				{project.image ? (
					<img
						src={project.image}
						alt={project.title}
						className="size-full object-cover"
					/>
				) : (
					<div
						aria-hidden="true"
						className="from-ink-700 to-ink-900 size-full bg-linear-to-br"
					/>
				)}
			</div>

			<div className="mt-10 max-w-3xl">
				<h1 className="text-h1 font-display max-[720px]:text-h3 wrap-break-word">
					{project.title}
				</h1>
				<Badge variant="brand" className="mt-4">
					{project.category}
				</Badge>
				<p className="text-body-lg text-text-secondary mt-6">
					{project.summary}
				</p>
			</div>

			{project.credits.length > 0 && (
				<dl className="border-surface-border mt-10 grid max-w-3xl gap-6 border-t pt-8 sm:grid-cols-2">
					{project.credits.map((credit) => (
						<div key={credit.label}>
							<dt className="text-label text-text-secondary font-mono tracking-wide uppercase">
								{credit.label}
							</dt>
							<dd className="text-body mt-1 font-medium">{credit.value}</dd>
						</div>
					))}
				</dl>
			)}

			{project.gallery.length > 0 && (
				<div data-gallery className="mt-12 grid gap-6 sm:grid-cols-2">
					{project.gallery.map((item, index) =>
						item.src ? (
							<img
								key={index}
								src={item.src}
								alt={item.alt}
								className="aspect-16/10 w-full rounded-2xl object-cover"
							/>
						) : (
							<div
								key={index}
								aria-hidden="true"
								className="from-ink-100 to-ink-200 aspect-16/10 rounded-2xl bg-linear-to-br"
							/>
						)
					)}
				</div>
			)}
		</Container>
	);
}

/** One project, looked up by the `:slug` in the address. */
export default function ProjectDetail(): React.JSX.Element {
	const { slug = "" } = useParams();
	const project = getProject(slug);
	return project ? <ProjectView project={project} /> : <NotFound />;
}
