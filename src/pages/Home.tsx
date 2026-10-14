import { useRef } from "react";
import { Link } from "react-router";
import { Footer } from "../components/layout/Footer";
import { useContact } from "../components/layout/Contact";
import { Nav } from "../components/layout/Nav";
import { buttonVariants } from "../components/ui/Button";
import { DotGrid } from "../components/ui/DotGrid";
import { headlineLines, tagline, useT } from "../i18n";
import { useSeo } from "../seo/useSeo";
import { usePointerGlow } from "../lib/usePointerGlow";
import { cn } from "../lib/cn";

/** The home page: one full-screen section holding the nav, the hero and the footer. */
export default function Home(): React.JSX.Element {
	useSeo({ name: "home" });
	const { open: openContact } = useContact();
	const { locale, t, to } = useT();
	const lines = headlineLines(locale);
	// Longer lines (Indonesian) are set smaller so no line has to wrap inside its mask.
	const fit = Math.min(1, 15 / Math.max(...lines.map((line) => line.length)));
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
							aria-label={tagline(locale)}
							style={{ "--fit": fit } as React.CSSProperties}
							className="font-display text-[calc(clamp(1.75rem,8.5vw,2.75rem)*var(--fit))] leading-[0.95] font-bold tracking-tight lg:text-[calc(clamp(3rem,7vw,6.5rem)*var(--fit))]"
						>
							{lines.map((line, index) => (
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
								{t("home.description")}
							</p>
							<div className="flex flex-wrap gap-3">
								<Link
									to={to("/projects")}
									className={cn(
										buttonVariants({ variant: "primary", size: "lg" })
									)}
								>
									{t("home.viewProjects")}
								</Link>
								<button
									type="button"
									onClick={openContact}
									className={cn(
										buttonVariants({ variant: "outline", size: "lg" })
									)}
								>
									{t("home.contact")}
								</button>
							</div>
						</div>
					</div>
				</div>

				<Footer variant="overlay" />
			</section>
		</main>
	);
}
