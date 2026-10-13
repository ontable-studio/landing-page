import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SITE } from "./common/constants";
import { projects } from "./data/projects";
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

	it("renders the projects page at /projects", () => {
		renderAt("/projects");
		expect(
			screen.getByRole("heading", { level: 1, name: "Projects" })
		).toBeInTheDocument();
	});

	it("renders a project at /projects/<slug>", () => {
		renderAt(`/projects/${projects[0].slug}`);
		expect(
			screen.getByRole("heading", { level: 1, name: projects[0].title })
		).toBeInTheDocument();
	});

	it("renders not found at an unknown project", () => {
		renderAt("/projects/nope");
		expect(
			screen.getByRole("heading", { name: /page not found/i })
		).toBeInTheDocument();
	});

	it("keeps the nav and footer on every page", () => {
		renderAt("/nope");
		expect(screen.getByRole("navigation")).toBeInTheDocument();
		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
	});
});
