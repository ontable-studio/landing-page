import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router";
import { ContactProvider } from "./components/layout/Contact";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { DotGrid } from "./components/ui/DotGrid";
import { preventMediaDrag } from "./lib/preventMediaDrag";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

/** Nav, page and footer around every page except Home, which holds its own inside one screen. */
function SiteLayout(): React.JSX.Element {
	const { pathname } = useLocation();
	return (
		<div className="relative">
			<DotGrid className="opacity-40" />
			<div className="relative">
				<Nav />
				<main key={pathname} className="animate-fade-in">
					<Outlet />
				</main>
				<Footer />
			</div>
		</div>
	);
}

export default function App(): React.JSX.Element {
	// No picture on any page can be picked up and dragged away (the CSS covers most browsers, this covers Firefox).
	useEffect(() => preventMediaDrag(), []);

	return (
		<ContactProvider>
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/id" element={<Home />} />
				<Route element={<SiteLayout />}>
					<Route path="/projects" element={<Projects />} />
					<Route path="/projects/:slug" element={<ProjectDetail />} />
					<Route path="/id/projects" element={<Projects />} />
					<Route path="/id/projects/:slug" element={<ProjectDetail />} />
					<Route path="/design-system" element={<DesignSystem />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</ContactProvider>
	);
}
