import { Route, Routes } from "react-router";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import DesignSystem from "./pages/DesignSystem";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

export default function App(): React.JSX.Element {
	return (
		<>
			<Nav />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/design-system" element={<DesignSystem />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
			<Footer />
		</>
	);
}
