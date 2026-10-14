import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { projects, type Project } from "../data/projects";
import ProjectDetail, { ProjectView } from "./ProjectDetail";

function at(slug: string) {
	return render(
		<MemoryRouter initialEntries={[`/projects/${slug}`]}>
			<Routes>
				<Route path="/projects/:slug" element={<ProjectDetail />} />
			</Routes>
		</MemoryRouter>
	);
}

function view(project: Project) {
	return render(
		<MemoryRouter>
			<ProjectView project={project} />
		</MemoryRouter>
	);
}

// A real project with credits and a gallery.
const full = projects.find(
	(p) => p.credits.length > 0 && p.gallery.length > 0
)!;

const bare: Project = {
	slug: "bare",
	title: "Bare Project",
	type: "Game",
	category: "Test",
	summary: "Only a title and a summary.",
	credits: [],
	gallery: [],
};

const rich: Project = {
	slug: "rich",
	title: "Rich Project",
	type: "Game",
	category: "Test",
	year: 2025,
	summary: "Everything filled in.",
	image: "/images/projects/rich/cover.webp",
	credits: [{ label: "Platform", value: "PC" }],
	gallery: [
		{ src: "/images/projects/rich/a.webp", alt: "Screenshot A" },
		{ alt: "Missing picture" },
	],
};

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

	it("renders every real project without crashing", () => {
		for (const project of projects) {
			const { unmount } = at(project.slug);
			expect(
				screen.getByRole("heading", { level: 1, name: project.title })
			).toBeInTheDocument();
			unmount();
		}
	});

	it("shows the not-found view for an unknown slug", () => {
		at("nope");
		expect(
			screen.getByRole("heading", { name: /page not found/i })
		).toBeInTheDocument();
		expect(document.title).toBe("Page not found — OnTable");
	});
});

describe("ProjectView with sparse and rich data", () => {
	it("renders a complete page for a project with no credits, gallery, image or year", () => {
		const { container } = view(bare);
		expect(
			screen.getByRole("heading", { level: 1, name: bare.title })
		).toBeInTheDocument();
		expect(screen.getByText(bare.summary)).toBeInTheDocument();
		expect(container.querySelector("dl")).toBeNull();
		expect(container.querySelector("[data-gallery]")).toBeNull();
		expect(container.querySelector("[data-year]")).toBeNull();
	});

	it("falls back to a hidden gradient in the hero when there is no image", () => {
		const { container } = view(bare);
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(hero.querySelector("img")).toBeNull();
		expect(
			hero.querySelectorAll('[aria-hidden="true"]').length
		).toBeGreaterThan(0);
	});

	it("fills the hero with the project image, decoratively", () => {
		const { container } = view(rich);
		const img = container.querySelector("[data-hero] img") as HTMLImageElement;
		expect(img).toHaveAttribute("src", rich.image);
		expect(img).toHaveAttribute("alt", "");
	});

	it("shows the year over the hero only when there is one", () => {
		const { container } = view(rich);
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(within(hero).getByText("2025")).toBeInTheDocument();
	});

	it("renders gallery pictures with their alt text and a hidden gradient for a missing source", () => {
		const { container } = view(rich);
		expect(screen.getByRole("img", { name: "Screenshot A" })).toHaveAttribute(
			"src",
			"/images/projects/rich/a.webp"
		);
		expect(
			container.querySelectorAll('[data-gallery] [aria-hidden="true"]')
		).toHaveLength(1);
	});

	it("shows a status pill over the hero when the project is in development", () => {
		const { container } = view({ ...bare, status: "In development" });
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(within(hero).getByText("In development")).toBeInTheDocument();
	});

	it("renders each link as an external button, and none when there are no links", () => {
		const { unmount } = view({
			...bare,
			links: [
				{ label: "Play on itch.io", href: "https://example.itch.io/game" },
			],
		});
		const link = screen.getByRole("link", { name: "Play on itch.io" });
		expect(link).toHaveAttribute("href", "https://example.itch.io/game");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
		unmount();
		view(bare);
		expect(
			screen.queryByRole("link", { name: /itch/i })
		).not.toBeInTheDocument();
	});

	it("gives the summary the full width when there are no credits", () => {
		const { container } = view(bare);
		const body = container.querySelector("[data-body]") as HTMLElement;
		expect(body.className).not.toMatch(/lg:grid-cols-/);
		expect(within(body).getByText(bare.summary)).toBeInTheDocument();
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

	it("puts the title, category and Back link over the hero", () => {
		const { container } = at(full.slug);
		const hero = container.querySelector("[data-hero]") as HTMLElement;
		expect(
			within(hero).getByRole("heading", { level: 1, name: full.title })
		).toBeInTheDocument();
		expect(within(hero).getByText(full.category)).toBeInTheDocument();
		expect(within(hero).getByRole("link", { name: "Back" })).toHaveAttribute(
			"href",
			"/projects"
		);
	});

	it("sets the summary and the credits side by side on large screens", () => {
		const { container } = at(full.slug);
		const body = container.querySelector("[data-body]") as HTMLElement;
		expect(body.className).toMatch(/lg:grid-cols-/);
		expect(within(body).getByText(full.summary)).toBeInTheDocument();
		expect(body.querySelector("dl")).toBeInTheDocument();
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
