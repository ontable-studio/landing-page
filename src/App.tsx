import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router";
import { ContactProvider } from "./components/layout/Contact";
import { CrtProvider } from "./components/layout/CrtShader";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { RouteTransition } from "./components/layout/RouteTransition";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { SkipLink } from "./components/layout/SkipLink";
import { preventMediaDrag } from "./lib/preventMediaDrag";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

/** Fixed nav, warm solid page canvas (no floor grid), and footer around non-Home routes. */
function SiteLayout(): React.JSX.Element {
	const { pathname } = useLocation();
	return (
		<div className="bg-cream relative flex min-h-svh flex-col">
			<SkipLink />
			<Nav />
			<main
				id="main-content"
				tabIndex={-1}
				key={pathname}
				className="animate-fade-in flex-1 pt-16 focus:outline-none lg:pt-18"
			>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}

export default function App(): React.JSX.Element {
	// No picture on any page can be picked up and dragged away (the CSS covers most browsers, this covers Firefox).
	useEffect(() => preventMediaDrag(), []);

	return (
		<CrtProvider>
			<ContactProvider>
				<ScrollToTop />
				<RouteTransition />
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
		</CrtProvider>
	);
}
