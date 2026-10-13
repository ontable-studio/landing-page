import { SITE } from "../common/constants";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/layout/SectionHeader";

/** Placeholder until the Hero section is designed. */
export default function Home(): React.JSX.Element {
	return (
		<Container className="py-section lg:py-section-lg">
			<SectionHeader as="h1" title="OnTable" description={SITE.tagline} />
		</Container>
	);
}
