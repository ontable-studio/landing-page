import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Nav } from "./Nav";

function setup(variant?: "bar" | "overlay") {
	render(
		<MemoryRouter>
			<Nav variant={variant} />
		</MemoryRouter>
	);
}

describe("Nav", () => {
	it("links the logo to the home page", () => {
		setup();
		expect(screen.getByRole("link", { name: /ontable/i })).toHaveAttribute(
			"href",
			"/"
		);
	});

	it("links to Projects", () => {
		setup();
		expect(
			screen.getAllByRole("link", { name: "Projects" })[0]
		).toHaveAttribute("href", "/projects");
	});

	it("bar variant scrolls away with the page: not sticky, not blurred", () => {
		setup();
		const cls = screen.getByRole("navigation").className;
		expect(cls).not.toMatch(/sticky|fixed|backdrop-blur/);
		expect(cls).toMatch(/border-b/);
	});

	it("overlay variant is plain: no sticky, no blur, no border", () => {
		setup("overlay");
		const cls = screen.getByRole("navigation").className;
		expect(cls).not.toMatch(/sticky|backdrop-blur|border/);
		expect(screen.getByRole("link", { name: /ontable/i })).toHaveAttribute(
			"href",
			"/"
		);
	});

	it("toggles the menu and closes it on Escape, returning focus", async () => {
		setup();
		const toggle = screen.getByRole("button", { name: /menu/i });
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(toggle);
		expect(toggle).toHaveAttribute("aria-expanded", "true");
		await userEvent.keyboard("{Escape}");
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(toggle).toHaveFocus();
	});
});
