import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { projectTypes, projects } from "../data/projects";
import Projects from "./Projects";

function setup(path = "/projects") {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Projects />
		</MemoryRouter>
	);
}

const cards = () =>
	screen
		.getAllByRole("link")
		.filter((a) => a.getAttribute("href")?.startsWith("/projects/"));

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

	it("shows exactly one card per project by default", () => {
		setup();
		expect(cards()).toHaveLength(projects.length);
	});

	it("sets the tab title", () => {
		setup();
		expect(document.title).toBe("Projects — OnTable Studio");
	});

	it("puts the project cards at heading level 2, straight under the page's h1", () => {
		const { container } = setup();
		expect(container.querySelectorAll("h1")).toHaveLength(1);
		expect(container.querySelectorAll("h2")).toHaveLength(projects.length);
		expect(container.querySelectorAll("h3")).toHaveLength(0);
	});

	it("lays the cards out two per row from the md breakpoint", () => {
		setup();
		const grid = screen.getByRole("tabpanel").firstElementChild;
		expect(grid?.className).toMatch(/md:grid-cols-2/);
	});

	it("uses the wide container with tight vertical padding", () => {
		const { container } = setup();
		const root = container.firstElementChild;
		expect(root?.className).toMatch(/max-w-7xl/);
		expect(root?.className).not.toMatch(/py-section/);
	});
});

describe("Projects type tabs", () => {
	it("offers All plus one tab per project type, with All selected", () => {
		setup();
		const tabs = within(
			screen.getByRole("tablist", { name: "Project types" })
		).getAllByRole("tab");
		expect(tabs.map((t) => t.textContent)).toEqual(["All", ...projectTypes]);
		expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("filters the cards when a type is chosen", async () => {
		setup();
		const type = projectTypes[projectTypes.length - 1];
		await userEvent.click(screen.getByRole("tab", { name: type }));
		const expected = projects.filter((p) => p.type === type);
		expect(cards()).toHaveLength(expected.length);
		for (const p of expected) {
			expect(
				screen.getByRole("link", { name: new RegExp(p.title) })
			).toBeInTheDocument();
		}
		expect(screen.getByRole("tab", { name: type })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("goes back to every project on All", async () => {
		setup();
		await userEvent.click(screen.getByRole("tab", { name: projectTypes[0] }));
		await userEvent.click(screen.getByRole("tab", { name: "All" }));
		expect(cards()).toHaveLength(projects.length);
	});

	it("reads the type from the address, so a refresh keeps it", () => {
		const type = projectTypes[projectTypes.length - 1];
		const slug = type.toLowerCase().replace(/\s+/g, "-");
		setup(`/projects?type=${slug}`);
		expect(screen.getByRole("tab", { name: type })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(cards()).toHaveLength(
			projects.filter((p) => p.type === type).length
		);
	});

	it("falls back to All for an unknown type in the address", () => {
		setup("/projects?type=nope");
		expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(cards()).toHaveLength(projects.length);
	});

	it("labels the panel with the selected tab", () => {
		setup();
		const panel = screen.getByRole("tabpanel");
		const tab = screen.getByRole("tab", { name: "All" });
		expect(panel).toHaveAttribute("aria-labelledby", tab.id);
	});
});

describe("Projects filter animation", () => {
	afterEach(() => {
		Reflect.deleteProperty(document, "startViewTransition");
	});

	it("runs the filter inside a view transition when the browser has one", async () => {
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
		setup();
		await userEvent.click(screen.getByRole("tab", { name: projectTypes[0] }));
		expect(start).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("tab", { name: projectTypes[0] })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("swallows an aborted view transition instead of leaving an unhandled rejection", async () => {
		const aborted = () =>
			Promise.reject(new DOMException("aborted", "InvalidStateError"));
		const start = vi.fn((update: () => void) => {
			update();
			return {
				ready: aborted(),
				finished: aborted(),
				updateCallbackDone: Promise.resolve(),
			};
		});
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			value: start,
		});
		setup();
		await userEvent.click(screen.getByRole("tab", { name: projectTypes[0] }));
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(screen.getByRole("tab", { name: projectTypes[0] })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("skips the view transition while the page is hidden", async () => {
		const start = vi.fn();
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			value: start,
		});
		Object.defineProperty(document, "hidden", {
			configurable: true,
			get: () => true,
		});
		setup();
		await userEvent.click(screen.getByRole("tab", { name: projectTypes[0] }));
		Reflect.deleteProperty(document, "hidden");
		expect(start).not.toHaveBeenCalled();
		expect(screen.getByRole("tab", { name: projectTypes[0] })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("still filters where view transitions do not exist", async () => {
		setup();
		await userEvent.click(screen.getByRole("tab", { name: projectTypes[0] }));
		expect(screen.getByRole("tab", { name: projectTypes[0] })).toHaveAttribute(
			"aria-selected",
			"true"
		);
	});

	it("wraps every card so it can be matched across a filter", () => {
		const { container } = setup();
		expect(container.querySelectorAll("[data-card]")).toHaveLength(
			projects.length
		);
	});
});
