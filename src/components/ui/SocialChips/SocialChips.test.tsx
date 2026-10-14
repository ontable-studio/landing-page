import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialChips } from "./SocialChips";

const links = [
	{ label: "Instagram", href: "https://www.instagram.com/example/" },
	{ label: "itch.io", href: "https://example.itch.io/" },
	{ label: "Somewhere else", href: "https://example.test/" },
];

describe("SocialChips", () => {
	it("renders one link per item to its address", () => {
		render(<SocialChips links={links} />);
		for (const link of links) {
			expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
				"href",
				link.href
			);
		}
	});

	it("opens every link in a new tab without leaking the opener", () => {
		render(<SocialChips links={links} />);
		for (const link of screen.getAllByRole("link")) {
			expect(link).toHaveAttribute("target", "_blank");
			expect(link.getAttribute("rel")).toContain("noopener");
			expect(link.getAttribute("rel")).toContain("noreferrer");
		}
	});

	it("shows a decorative icon for the known networks only", () => {
		const { container } = render(<SocialChips links={links} />);
		const chips = container.querySelectorAll("a");
		expect(
			chips[0].querySelector('svg[aria-hidden="true"]')
		).toBeInTheDocument();
		expect(
			chips[1].querySelector('svg[aria-hidden="true"]')
		).toBeInTheDocument();
		expect(chips[2].querySelector("svg")).toBeNull();
	});

	it("draws each as a pill that reacts to hover and keyboard focus", () => {
		render(<SocialChips links={links} />);
		for (const link of screen.getAllByRole("link")) {
			expect(link.className).toContain("rounded-full");
			expect(link.className).toContain("border");
			expect(link.className).toContain("hover:bg-surface");
			expect(link.className).toContain("focus-visible:bg-surface");
			expect(link.className).toContain("focus-visible:outline-brand");
		}
	});

	it("is a list, so a screen reader announces how many there are", () => {
		render(<SocialChips links={links} />);
		expect(screen.getByRole("list")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(links.length);
	});

	it("passes a className to the list", () => {
		render(<SocialChips links={links} className="justify-end" />);
		expect(screen.getByRole("list").className).toContain("justify-end");
	});
});
