import { Link } from "react-router";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/layout/SectionHeader";
import { useSeo } from "../seo/useSeo";

export default function NotFound(): React.JSX.Element {
	useSeo({ name: "not-found" });

	return (
		<Container size="wide" className="py-section lg:py-section-lg">
			<SectionHeader as="h1" title="Page not found" />
			<Link
				to="/"
				className="text-brand mt-6 inline-block font-medium underline"
			>
				Back to home
			</Link>
		</Container>
	);
}
