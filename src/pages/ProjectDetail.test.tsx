import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
		const { container } = at(full.slug);
		const body = within(container.querySelector("[data-body]") as HTMLElement);
		expect(
			screen.getByRole("heading", { level: 1, name: full.title })
		).toBeInTheDocument();
		expect(body.getByText(full.summary)).toBeInTheDocument();
		for (const credit of full.credits) {
			expect(body.getByText(credit.label)).toBeInTheDocument();
			expect(body.getByText(credit.value)).toBeInTheDocument();
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

describe("ProjectDetail layout", () => {
	it("opens with a full-bleed hero outside the page container", () => {
		const { container } = at(full.slug);
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(hero).toBeInTheDocument();
		expect(hero.closest(".max-w-7xl")).toBeNull();
		expect(hero.className).toMatch(/\bw-full\b/);
		expect(hero.className).toMatch(/h-\[70svh\]/);
		expect(hero.className).not.toMatch(/rounded/);
	});

	it("puts the title, category, year and Back link over the hero", () => {
		const { container } = at(full.slug);
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(
			within(hero).getByRole("heading", { level: 1, name: full.title })
		).toBeInTheDocument();
		expect(within(hero).getByText(full.category)).toBeInTheDocument();
		expect(within(hero).getByText(String(full.year))).toBeInTheDocument();
		expect(within(hero).getByRole("link", { name: "Back" })).toHaveAttribute(
			"href",
			"/projects"
		);
	});

	it("falls back to a hidden gradient when the project has no image", () => {
		const { container } = at(full.slug);
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(hero.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});

	it("sets the summary and the credits side by side on large screens", () => {
		const { container } = at(full.slug);
		const body = container.querySelector("[data-body]") as HTMLElement;
		expect(body.className).toMatch(/lg:grid-cols-/);
		expect(within(body).getByText(full.summary)).toBeInTheDocument();
		expect(body.querySelector("dl")).toBeInTheDocument();
	});

	it("gives the summary the full width when there are no credits", () => {
		const { container } = at(empty.slug);
		const body = container.querySelector("[data-body]") as HTMLElement;
		expect(body.className).not.toMatch(/lg:grid-cols-/);
		expect(within(body).getByText(empty.summary)).toBeInTheDocument();
	});

	it("labels credits in plain sentence case, not all caps", () => {
		const { container } = at(full.slug);
		const dt = container.querySelector("dt") as HTMLElement;
		expect(dt.className).not.toMatch(/uppercase/);
	});

	it("makes the first gallery item span both columns", () => {
		const { container } = at(full.slug);
		const gallery = container.querySelector("[data-gallery]") as HTMLElement;
		expect(gallery.firstElementChild?.className).toMatch(/sm:col-span-2/);
	});
});
