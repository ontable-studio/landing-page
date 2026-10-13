import { Route, Routes } from "react-router";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

export default function App(): React.JSX.Element {
	return (
		<>
			<ScrollToTop />
			<Nav />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/projects" element={<Projects />} />
					<Route path="/projects/:slug" element={<ProjectDetail />} />
					<Route path="/design-system" element={<DesignSystem />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
			<Footer />
		</>
	);
}
