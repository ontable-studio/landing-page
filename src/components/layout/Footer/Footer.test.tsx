import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SITE } from "../../../common/constants";
import { Footer } from "./Footer";

describe("Footer", () => {
	it("renders the tagline", () => {
		render(<Footer />);
		expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
	});

	it("overlay variant keeps the name and links but drops the tagline", () => {
		render(<Footer variant="overlay" />);
		expect(screen.getByText(SITE.name)).toBeInTheDocument();
		expect(screen.queryByText(SITE.tagline)).not.toBeInTheDocument();
		for (const s of SITE.social) {
			expect(screen.getByRole("link", { name: s.label })).toHaveAttribute(
				"href",
				s.href
			);
		}
	});

	it("underlines the social links from the left on hover and focus", () => {
		render(<Footer />);
		for (const s of SITE.social) {
			const cls = screen.getByRole("link", { name: s.label }).className;
			expect(cls).toContain("hover:after:scale-x-100");
			expect(cls).toContain("focus-visible:after:scale-x-100");
		}
	});

	it("renders every social link", () => {
		render(<Footer />);
		for (const s of SITE.social) {
			expect(screen.getByRole("link", { name: s.label })).toHaveAttribute(
				"href",
				s.href
			);
		}
	});
});
