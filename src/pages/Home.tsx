import { Link } from "react-router";
import { SITE } from "../common/constants";
import { buttonVariants } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { cn } from "../lib/cn";

/** The home page: one Hero section. */
export default function Home(): React.JSX.Element {
	useDocumentTitle("OnTable");

	return (
		<section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-radial-[at_75%_30%] from-orange-200/70 via-orange-50/40 to-transparent"
			/>
			<img
				src="/images/ontable-logo.svg"
				alt=""
				aria-hidden="true"
				className="absolute -right-20 -bottom-20 size-112 opacity-90 max-[720px]:size-56"
			/>
			<Container className="py-section relative">
				<h1 className="animate-rise-quick font-display text-h1 lg:text-display max-[720px]:text-h2 max-w-3xl">
					{SITE.tagline}
				</h1>
				<p className="animate-rise-quick text-body-lg text-text-secondary mt-6 max-w-xl">
					A small team building games, products and projects.
				</p>
				<div className="animate-rise-quick mt-10 flex flex-wrap gap-3">
					<Link
						to="/projects"
						className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
					>
						View projects
					</Link>
					<a
						href={`mailto:${SITE.email}`}
						className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
					>
						Contact
					</a>
				</div>
			</Container>
		</section>
	);
}
