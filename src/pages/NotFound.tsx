import { Link } from "react-router";
import { useT } from "../i18n";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/layout/SectionHeader";
import { useSeo } from "../seo/useSeo";

export default function NotFound(): React.JSX.Element {
	useSeo({ name: "not-found" });
	const { t, to } = useT();

	return (
		<Container size="wide" className="py-section lg:py-section-lg">
			<SectionHeader as="h1" title={t("notFound.title")} />
			<Link
				to={to("/")}
				className="text-brand mt-6 inline-block font-medium underline"
			>
				{t("notFound.back")}
			</Link>
		</Container>
	);
}
