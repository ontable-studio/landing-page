import { Outlet, Route, Routes } from "react-router";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { DotGrid } from "./components/ui/DotGrid";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

/** Nav, page and footer around every page except Home, which holds its own inside one screen. */
function SiteLayout(): React.JSX.Element {
	return (
		<div className="relative">
			<DotGrid className="opacity-40" />
			<div className="relative">
				<Nav />
				<main>
					<Outlet />
				</main>
				<Footer />
			</div>
		</div>
	);
}

export default function App(): React.JSX.Element {
	return (
		<>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route element={<SiteLayout />}>
					<Route path="/projects" element={<Projects />} />
					<Route path="/projects/:slug" element={<ProjectDetail />} />
					<Route path="/design-system" element={<DesignSystem />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</>
	);
}
