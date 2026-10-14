import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ContactProvider } from "../Contact";
import { Nav } from "./Nav";

function setup(variant?: "bar" | "overlay") {
	render(
		<MemoryRouter>
			<ContactProvider>
				<Nav variant={variant} />
			</ContactProvider>
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

	it("bar variant scrolls away with the page: not sticky, not blurred, no border", () => {
		setup();
		const cls = screen.getByRole("navigation").className;
		expect(cls).not.toMatch(/sticky|fixed|backdrop-blur|border/);
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

	it("opens the bar's mobile menu without a border", async () => {
		setup();
		await userEvent.click(screen.getByRole("button", { name: /menu/i }));
		const menu = document.getElementById("mobile-menu");
		expect(menu).toBeInTheDocument();
		expect(menu?.className).not.toMatch(/border/);
	});

	it("underlines the Projects link and the Contact button from the left on hover and focus", () => {
		setup();
		const items = [
			screen.getByRole("link", { name: "Projects" }),
			screen.getAllByRole("button", { name: "Contact" })[0],
		];
		for (const item of items) {
			expect(item.className).toContain("after:scale-x-0");
			expect(item.className).toContain("hover:after:scale-x-100");
			expect(item.className).toContain("focus-visible:after:scale-x-100");
		}
	});

	it("makes Contact a button that opens the contact dialog, not a mailto link", async () => {
		setup();
		expect(
			screen.queryByRole("link", { name: "Contact" })
		).not.toBeInTheDocument();
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		await userEvent.click(
			screen.getAllByRole("button", { name: "Contact" })[0]
		);
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
	});

	it("closes the mobile menu and opens the dialog from the menu's Contact", async () => {
		setup();
		const toggle = screen.getByRole("button", { name: /menu/i });
		await userEvent.click(toggle);
		const menu = document.getElementById("mobile-menu") as HTMLElement;
		await userEvent.click(
			within(menu).getByRole("button", { name: "Contact" })
		);
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
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
