import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { projects } from "../data/projects";
import Projects from "./Projects";

function setup() {
	return render(
		<MemoryRouter>
			<Projects />
		</MemoryRouter>
	);
}

describe("Projects", () => {
	it("has a level-1 heading", () => {
		setup();
		expect(
			screen.getByRole("heading", { level: 1, name: "Projects" })
		).toBeInTheDocument();
	});

	it("links every project to its detail page", () => {
		setup();
		for (const project of projects) {
			const link = screen.getByRole("link", {
				name: new RegExp(project.title),
			});
			expect(link).toHaveAttribute("href", `/projects/${project.slug}`);
		}
	});

	it("shows exactly one card per project", () => {
		setup();
		const links = screen
			.getAllByRole("link")
			.filter((a) => a.getAttribute("href")?.startsWith("/projects/"));
		expect(links).toHaveLength(projects.length);
	});

	it("sets the tab title", () => {
		setup();
		expect(document.title).toBe("Projects — OnTable");
	});
});
