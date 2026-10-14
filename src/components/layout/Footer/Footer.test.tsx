import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SITE } from "../../../common/constants";
import { Footer } from "./Footer";

describe("Footer", () => {
	it("renders the tagline", () => {
		render(<Footer />);
		expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
	});

	it("overlay variant keeps the name and the social chips but drops the tagline", () => {
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

	it("shows Instagram and itch.io as chips, not as plain text links", () => {
		render(<Footer />);
		for (const name of ["Instagram", "itch.io"]) {
			const chip = screen.getByRole("link", { name });
			expect(chip.className).toContain("rounded-full");
			expect(chip.className).toContain("border");
			expect(chip.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
		}
	});

	it("puts the chips at the right of both footers", () => {
		for (const variant of ["bar", "overlay"] as const) {
			const { container, unmount } = render(<Footer variant={variant} />);
			const footer = container.querySelector("footer") as HTMLElement;
			const list = within(footer).getByRole("list");
			expect(list.parentElement?.lastElementChild).toBe(list);
			unmount();
		}
	});

	it("opens the chips in a new tab", () => {
		render(<Footer />);
		for (const s of SITE.social) {
			expect(screen.getByRole("link", { name: s.label })).toHaveAttribute(
				"target",
				"_blank"
			);
		}
	});
});
