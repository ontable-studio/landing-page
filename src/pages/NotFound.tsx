import { Link } from "react-router";
import { useT } from "../i18n";
import { cn } from "../lib/cn";
import { buttonVariants } from "../components/ui/Button";
import { SectionFrame } from "../components/layout/SectionFrame";
import { SectionHeader } from "../components/layout/SectionHeader";
import { useSeo } from "../seo/useSeo";

export default function NotFound(): React.JSX.Element {
	useSeo({ name: "not-found" });
	const { t, to } = useT();

	return (
		<SectionFrame
			surfaceClass="bg-cream"
			innerClassName="py-section lg:py-section-lg px-4 sm:px-6 lg:px-8"
		>
			<SectionHeader
				as="h1"
				eyebrow="404"
				title={t("notFound.title")}
				description={t("notFound.description")}
			/>
			<div className="mt-8 flex flex-wrap gap-3">
				<Link
					to={to("/")}
					className={cn(buttonVariants({ variant: "primary", size: "md" }))}
				>
					{t("notFound.back")}
				</Link>
				<Link
					to={to("/projects")}
					className={cn(buttonVariants({ variant: "outline", size: "md" }))}
				>
					{t("notFound.browseProjects")}
				</Link>
			</div>
		</SectionFrame>
	);
}
