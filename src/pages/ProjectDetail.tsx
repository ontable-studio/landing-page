import { Link, useParams } from "react-router";
import { Badge } from "../components/ui/Badge";
import { buttonVariants } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { getProject, type Project } from "../data/projects";
import { cn } from "../lib/cn";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import NotFound from "./NotFound";

/** One project's page. Exported so sparse data can be rendered directly in tests. */
export function ProjectView({
	project,
}: {
	project: Project;
}): React.JSX.Element {
	useDocumentTitle(`${project.title} — OnTable`);
	const hasCredits = project.credits.length > 0;

	return (
		<>
			<section
				data-hero=""
				className="bg-ink-900 relative h-[70svh] min-h-96 w-full overflow-hidden text-white"
			>
				{project.image ? (
					<img
						src={project.image}
						alt=""
						className="absolute inset-0 size-full object-cover"
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
						to="/projects"
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							"self-start border-white/50 bg-white/10 text-white hover:bg-white/20"
						)}
					>
						Back
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
							{project.title}
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
							return item.src ? (
								<img
									key={index}
									src={item.src}
									alt={item.alt}
									className={cn(
										"aspect-16/10 w-full rounded-2xl object-cover",
										span
									)}
								/>
							) : (
								<div
									key={index}
									aria-hidden="true"
									className={cn(
										"from-ink-100 to-ink-200 aspect-16/10 rounded-2xl bg-linear-to-br",
										span
									)}
								/>
							);
						})}
					</div>
				)}
			</Container>
		</>
	);
}

/** One project, looked up by the `:slug` in the address. */
export default function ProjectDetail(): React.JSX.Element {
	const { slug = "" } = useParams();
	const project = getProject(slug);
	return project ? <ProjectView project={project} /> : <NotFound />;
}
