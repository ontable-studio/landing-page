import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SITE } from "../../../common/constants";
import { Footer } from "./Footer";

describe("Footer", () => {
	it("renders the tagline", () => {
		render(<Footer />);
		expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
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
