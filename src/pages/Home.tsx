import { useRef } from "react";
import { Link } from "react-router";
import { SITE } from "../common/constants";
import { Footer } from "../components/layout/Footer";
import { Nav } from "../components/layout/Nav";
import { buttonVariants } from "../components/ui/Button";
import { DotGrid } from "../components/ui/DotGrid";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { usePointerGlow } from "../lib/usePointerGlow";
import { cn } from "../lib/cn";

/** The home page: one full-screen section holding the nav, the hero and the footer. */
export default function Home(): React.JSX.Element {
	useDocumentTitle("OnTable");
	const sectionRef = useRef<HTMLElement>(null);
	usePointerGlow(sectionRef);

	return (
		<main>
			<section
				ref={sectionRef}
				className="relative flex min-h-svh flex-col overflow-x-clip"
			>
				<DotGrid interactive />
				<img
					src="/images/ontable-logo.svg"
					alt=""
					aria-hidden="true"
					style={{
						translate: "calc(var(--nx, 0) * -20px) calc(var(--ny, 0) * -20px)",
					}}
					className="absolute top-[8%] -right-32 size-112 max-[720px]:top-20 max-[720px]:-right-24 max-[720px]:size-56"
				/>
				<Nav variant="overlay" />

				<div className="relative z-10 flex flex-1 items-end px-6 pb-10 lg:px-10 lg:pb-14">
					<div className="grid w-full items-end gap-10 lg:grid-cols-[1fr_22rem]">
						<h1
							aria-label={SITE.tagline}
							className="font-display text-[clamp(1.75rem,8.5vw,2.75rem)] leading-[0.95] font-bold tracking-tight lg:text-[clamp(3rem,7vw,6.5rem)]"
						>
							{SITE.taglineLines.map((line, index) => (
								<span
									key={line}
									className="mb-[-0.2em] block overflow-hidden pb-[0.2em]"
								>
									<span
										data-line=""
										className="animate-line-rise block"
										style={{ animationDelay: `${index * 70}ms` }}
									>
										{line}
									</span>
								</span>
							))}
						</h1>

						<div className="flex flex-col gap-6 lg:pb-3">
							<p className="text-body-lg text-text-secondary max-w-sm">
								A small team building games, products and projects.
							</p>
							<div className="flex flex-wrap gap-3">
								<Link
									to="/projects"
									className={cn(
										buttonVariants({ variant: "primary", size: "lg" })
									)}
								>
									View projects
								</Link>
								<a
									href={`mailto:${SITE.email}`}
									className={cn(
										buttonVariants({ variant: "outline", size: "lg" })
									)}
								>
									Contact
								</a>
							</div>
						</div>
					</div>
				</div>

				<Footer variant="overlay" />
			</section>
		</main>
	);
}
