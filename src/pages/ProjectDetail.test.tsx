import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
		expect(document.title).toBe(`${full.title} — OnTable Studio`);
	});

	it("gives the project its own canonical address and preview image", () => {
		at(full.slug);
		expect(
			document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
		).toBe(`https://landing-page-ontable.vercel.app/projects/${full.slug}`);
		expect(
			document.head
				.querySelector('meta[property="og:image"]')
				?.getAttribute("content")
		).toBe(`https://landing-page-ontable.vercel.app/og/${full.slug}.jpg`);
	});

	it("keeps a missing page out of search results", () => {
		at("nope");
		expect(
			document.head
				.querySelector('meta[name="robots"]')
				?.getAttribute("content")
		).toBe("noindex, nofollow");
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
		expect(document.title).toBe("Page not found — OnTable Studio");
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

	it("renders gallery pictures as buttons and a hidden gradient for a missing source", () => {
		const { container } = view(rich);
		const button = screen.getByRole("button", {
			name: "View larger: Screenshot A",
		});
		expect(button.querySelector("img")).toHaveAttribute(
			"src",
			"/images/projects/rich/a.webp"
		);
		expect(
			container.querySelectorAll('[data-gallery] > [aria-hidden="true"]')
		).toHaveLength(1);
		expect(
			screen.getAllByRole("button", { name: /view larger/i })
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
		expect(hero.className).toContain("h-[48svh]");
		expect(hero.className).toContain("lg:h-[56svh]");
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

describe("ProjectView image preview", () => {
	afterEach(() => {
		Reflect.deleteProperty(document, "startViewTransition");
	});

	const twoPictures: Project = {
		...rich,
		gallery: [
			{ src: "/images/projects/rich/a.webp", alt: "Screenshot A" },
			{ src: "/images/projects/rich/b.webp", alt: "Screenshot B" },
		],
	};

	it("opens a preview of the clicked picture and closes it with Escape, returning focus", async () => {
		view(twoPictures);
		const thumb = screen.getByRole("button", {
			name: "View larger: Screenshot B",
		});
		await userEvent.click(thumb);
		const dialog = screen.getByRole("dialog", { name: "Image preview" });
		expect(
			within(dialog).getByRole("img", { name: "Screenshot B" })
		).toBeInTheDocument();
		expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
		await userEvent.keyboard("{Escape}");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(thumb).toHaveFocus();
	});

	it("steps through the pictures in the preview", async () => {
		view(twoPictures);
		await userEvent.click(
			screen.getByRole("button", { name: "View larger: Screenshot A" })
		);
		await userEvent.keyboard("{ArrowRight}");
		expect(
			within(screen.getByRole("dialog")).getByRole("img", {
				name: "Screenshot B",
			})
		).toBeInTheDocument();
	});

	it("zooms from the thumbnail with a view transition where the browser has one", async () => {
		const start = vi.fn((update: () => void) => {
			update();
			return {
				ready: Promise.resolve(),
				finished: Promise.resolve(),
				updateCallbackDone: Promise.resolve(),
			};
		});
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			value: start,
		});
		view(twoPictures);
		await userEvent.click(
			screen.getByRole("button", { name: "View larger: Screenshot A" })
		);
		expect(start).toHaveBeenCalledTimes(1);
		await userEvent.keyboard("{Escape}");
		expect(start).toHaveBeenCalledTimes(2);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("zooms and shows an expand icon on hover and on keyboard focus", () => {
		const { container } = view(twoPictures);
		const button = screen.getByRole("button", {
			name: "View larger: Screenshot A",
		});
		expect(button.className).toMatch(/cursor-zoom-in/);
		expect(button.querySelector("img")?.className).toContain(
			"group-hover:scale-105"
		);
		expect(button.querySelector("img")?.className).toContain(
			"group-focus-visible:scale-105"
		);
		const chip = container.querySelector("[data-expand]") as HTMLElement;
		expect(chip).toHaveAttribute("aria-hidden", "true");
		expect(chip.className).toContain("group-hover:opacity-100");
		expect(chip.className).toContain("group-focus-visible:opacity-100");
	});
});

describe("ProjectView alive hero", () => {
	it("raises the title out of a mask with room for descenders", () => {
		const { container } = view(bare);
		const mask = container.querySelector("h1 > span") as HTMLElement;
		expect(mask.className).toContain("overflow-hidden");
		expect(mask.className).toContain("pb-[0.2em]");
		expect(mask.querySelector("[data-line]")?.className).toContain(
			"animate-line-rise"
		);
	});

	it("settles the cover image in and lets it drift against the pointer", () => {
		const { container } = view(rich);
		const img = container.querySelector("[data-hero] img") as HTMLImageElement;
		expect(img.className).toContain("animate-settle");
		expect(img.getAttribute("style")).toMatch(/var\(--nx/);
		expect(img.getAttribute("style")).toMatch(/var\(--ny/);
	});
});

describe("ProjectView next project", () => {
	it("links to the next project, with its card", () => {
		const { container } = at(projects[0].slug);
		const next = container.querySelector("[data-next]") as HTMLElement;
		expect(
			within(next).getByRole("heading", { level: 2, name: "Next project" })
		).toBeInTheDocument();
		expect(within(next).getByRole("link")).toHaveAttribute(
			"href",
			`/projects/${projects[1].slug}`
		);
	});

	it("loops from the last project back to the first", () => {
		const { container } = at(projects[projects.length - 1].slug);
		expect(container.querySelector("[data-next] a")).toHaveAttribute(
			"href",
			`/projects/${projects[0].slug}`
		);
	});

	it("is left out for a project that is not in the list", () => {
		const { container } = view(bare);
		expect(container.querySelector("[data-next]")).toBeNull();
	});
});
