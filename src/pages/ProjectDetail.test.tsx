import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { projects } from "../data/projects";
import ProjectDetail from "./ProjectDetail";

function at(slug: string) {
	return render(
		<MemoryRouter initialEntries={[`/projects/${slug}`]}>
			<Routes>
				<Route path="/projects/:slug" element={<ProjectDetail />} />
			</Routes>
		</MemoryRouter>
	);
}

const full = projects[0];
const empty = projects.find(
	(p) => p.credits.length === 0 && p.gallery.length === 0
)!;

describe("ProjectDetail", () => {
	it("shows title, summary, credits and a way back", () => {
		at(full.slug);
		expect(
			screen.getByRole("heading", { level: 1, name: full.title })
		).toBeInTheDocument();
		expect(screen.getByText(full.summary)).toBeInTheDocument();
		for (const credit of full.credits) {
			expect(screen.getByText(credit.label)).toBeInTheDocument();
			expect(screen.getByText(credit.value)).toBeInTheDocument();
		}
		expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
			"href",
			"/projects"
		);
	});

	it("sets the tab title from the project", () => {
		at(full.slug);
		expect(document.title).toBe(`${full.title} — OnTable`);
	});

	it("renders a hidden placeholder for gallery items without a source", () => {
		const { container } = at(full.slug);
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
		expect(
			container.querySelectorAll('[data-gallery] [aria-hidden="true"]')
		).toHaveLength(full.gallery.length);
	});

	it("renders a complete page for a project with no credits or gallery", () => {
		const { container } = at(empty.slug);
		expect(
			screen.getByRole("heading", { level: 1, name: empty.title })
		).toBeInTheDocument();
		expect(screen.getByText(empty.summary)).toBeInTheDocument();
		expect(container.querySelector("dl")).toBeNull();
		expect(container.querySelector("[data-gallery]")).toBeNull();
	});

	it("shows the not-found view for an unknown slug", () => {
		at("nope");
		expect(
			screen.getByRole("heading", { name: /page not found/i })
		).toBeInTheDocument();
		expect(document.title).toBe("Page not found — OnTable");
	});
});
