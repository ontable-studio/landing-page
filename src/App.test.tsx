import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SITE } from "./common/constants";
import App from "./App";

function renderAt(path: string) {
	render(
		<MemoryRouter initialEntries={[path]}>
			<App />
		</MemoryRouter>
	);
}

describe("App routes", () => {
	it("renders the home page at /", () => {
		renderAt("/");
		expect(
			screen.getByRole("heading", { level: 1, name: SITE.tagline })
		).toBeInTheDocument();
	});

	it("renders the style guide at /design-system", () => {
		renderAt("/design-system");
		expect(
			screen.getByRole("heading", { level: 1, name: "Design System" })
		).toBeInTheDocument();
	});

	it("renders a not-found view with a way home at an unknown path", () => {
		renderAt("/nope");
		expect(
			screen.getByRole("heading", { name: /not found/i })
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute(
			"href",
			"/"
		);
	});

	it("keeps the nav and footer on every page", () => {
		renderAt("/nope");
		expect(screen.getByRole("navigation")).toBeInTheDocument();
		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
	});
});
