import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

	it("has exactly one nav and one footer on the home page", () => {
		renderAt("/");
		expect(document.querySelectorAll("nav")).toHaveLength(1);
		expect(document.querySelectorAll("footer")).toHaveLength(1);
	});

	it("has exactly one nav and one footer on /projects", () => {
		renderAt("/projects");
		expect(document.querySelectorAll("nav")).toHaveLength(1);
		expect(document.querySelectorAll("footer")).toHaveLength(1);
	});

	it("shows a pointer-lit dot grid on the home page", () => {
		renderAt("/");
		expect(document.querySelector("[data-dot-grid]")).toBeInTheDocument();
		expect(document.querySelector("[data-glow]")).toBeInTheDocument();
	});

	it("shows a still dot grid, without the glow, behind the other pages", () => {
		renderAt("/projects");
		expect(document.querySelector("[data-dot-grid]")).toBeInTheDocument();
		expect(document.querySelector("[data-glow]")).toBeNull();
	});

	it("fades the page content in on each navigation, leaving nav and footer alone", async () => {
		renderAt("/projects");
		const nav = document.querySelector("nav");
		const mainBefore = document.querySelector("main");
		expect(mainBefore?.className).toMatch(/animate-fade-in/);
		await userEvent.click(
			screen.getByRole("link", { name: new RegExp(projects[0].title) })
		);
		expect(document.querySelector("main")).not.toBe(mainBefore);
		expect(document.querySelector("main")?.className).toMatch(
			/animate-fade-in/
		);
		expect(document.querySelector("nav")).toBe(nav);
	});

	it("cannot drag a picture on any page, including the project cards", () => {
		for (const path of ["/", "/projects", `/projects/${projects[0].slug}`]) {
			const { unmount } = render(
				<MemoryRouter initialEntries={[path]}>
					<App />
				</MemoryRouter>
			);
			const media = document.querySelectorAll("img");
			expect(media.length, path).toBeGreaterThan(0);
			for (const img of media) {
				const event = new Event("dragstart", {
					bubbles: true,
					cancelable: true,
				});
				img.dispatchEvent(event);
				expect(
					event.defaultPrevented,
					`${path} ${img.getAttribute("src")}`
				).toBe(true);
			}
			for (const card of document.querySelectorAll("a:has(img)")) {
				const event = new Event("dragstart", {
					bubbles: true,
					cancelable: true,
				});
				card.dispatchEvent(event);
				expect(event.defaultPrevented, path).toBe(true);
			}
			unmount();
		}
	});

	it("opens the contact dialog from the nav on any page, and Escape closes it", async () => {
		renderAt("/projects");
		await userEvent.click(
			screen.getAllByRole("button", { name: "Contact" })[0]
		);
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
		await userEvent.keyboard("{Escape}");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("opens the contact dialog from the home page's hero button", async () => {
		renderAt("/");
		const buttons = screen.getAllByRole("button", { name: "Contact" });
		await userEvent.click(buttons[buttons.length - 1]);
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
	});

	it("keeps the nav and footer on every page", () => {
		renderAt("/nope");
		expect(screen.getByRole("navigation")).toBeInTheDocument();
		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
	});
});
