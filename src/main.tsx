import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./styles/main.css";
import App from "./App";

const rootElement = document.querySelector<HTMLElement>("#app");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</StrictMode>
	);
}
