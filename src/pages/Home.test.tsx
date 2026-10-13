import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SITE } from "../common/constants";
import Home from "./Home";

function setup() {
	return render(
		<MemoryRouter>
			<Home />
		</MemoryRouter>
	);
}

describe("Home", () => {
	it("shows the tagline as the page heading", () => {
		setup();
		expect(
			screen.getByRole("heading", { level: 1, name: SITE.tagline })
		).toBeInTheDocument();
	});

	it("links to the projects", () => {
		setup();
		expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute(
			"href",
			"/projects"
		);
	});

	it("has contact links by email, in the nav and under the headline", () => {
		setup();
		const links = screen.getAllByRole("link", { name: "Contact" });
		expect(links).toHaveLength(2);
		for (const link of links) {
			expect(link).toHaveAttribute("href", `mailto:${SITE.email}`);
		}
	});

	it("sets the tab title", () => {
		setup();
		expect(document.title).toBe("OnTable");
	});

	it("hides the decorative mark from assistive technology", () => {
		const { container } = setup();
		const mark = container.querySelector('img[src="/images/ontable-logo.svg"]');
		expect(mark).toHaveAttribute("alt", "");
		expect(mark).toHaveAttribute("aria-hidden", "true");
	});

	it("raises the headline in three masked lines that join into the tagline", () => {
		const { container } = setup();
		const lines = [...container.querySelectorAll("h1 [data-line]")];
		expect(lines).toHaveLength(3);
		expect(lines.map((l) => l.textContent?.trim()).join(" ")).toBe(
			SITE.tagline
		);
		for (const line of lines) {
			expect(line.className).toContain("animate-line-rise");
		}
	});

	it("leaves room under every masked line for descenders like g and y", () => {
		const { container } = setup();
		const masks = [...container.querySelectorAll("h1 > span")];
		expect(masks).toHaveLength(3);
		for (const mask of masks) {
			expect(mask.className).toContain("pb-[0.2em]");
			expect(mask.className).toContain("mb-[-0.2em]");
		}
	});

	it("shows the description and buttons at once, without an entrance", () => {
		const { container } = setup();
		const description = screen.getByText(/small team building games/i);
		const buttons = screen.getByRole("link", { name: "View projects" });
		expect(description.className).not.toMatch(/animate-/);
		expect(buttons.parentElement?.className).not.toMatch(/animate-/);
		expect(container.querySelectorAll("[class*=animate-rise]")).toHaveLength(0);
	});

	it("holds the nav and the footer inside the one full-screen section", () => {
		const { container } = setup();
		const section = container.querySelector("section");
		expect(container.querySelectorAll("nav")).toHaveLength(1);
		expect(container.querySelectorAll("footer")).toHaveLength(1);
		expect(section).toContainElement(container.querySelector("nav"));
		expect(section).toContainElement(container.querySelector("footer"));
		expect(section?.className).toContain("min-h-svh");
	});

	it("uses a plain nav, with no sticky bar or blur", () => {
		const { container } = setup();
		const nav = container.querySelector("nav");
		expect(nav?.className).not.toMatch(/sticky|backdrop-blur|border-b/);
	});

	it("draws a flat orange disc with no gradient wash", () => {
		const { container } = setup();
		expect(container.innerHTML).not.toMatch(/bg-radial|bg-linear/);
	});

	it("lights the dots near the pointer behind the content", () => {
		const { container } = setup();
		const section = container.querySelector("section");
		const grid = container.querySelector("[data-dot-grid]");
		expect(section).toContainElement(grid as HTMLElement);
		expect(container.querySelector("[data-glow]")).toBeInTheDocument();
	});

	it("lets the logo disc drift against the pointer", () => {
		const { container } = setup();
		const disc = container.querySelector('img[src="/images/ontable-logo.svg"]');
		expect(disc?.getAttribute("style")).toMatch(/var\(--nx/);
		expect(disc?.getAttribute("style")).toMatch(/var\(--ny/);
	});

	it("is a single section", () => {
		const { container } = setup();
		expect(container.querySelectorAll("section")).toHaveLength(1);
	});
});
