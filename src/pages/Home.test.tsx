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

	it("has a contact link by email", () => {
		setup();
		expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
			"href",
			`mailto:${SITE.email}`
		);
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

	it("is a single section", () => {
		const { container } = setup();
		expect(container.querySelectorAll("section")).toHaveLength(1);
	});
});
