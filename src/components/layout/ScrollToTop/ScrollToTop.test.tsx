import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter } from "react-router";
import { ScrollToTop } from "./ScrollToTop";

describe("ScrollToTop", () => {
	beforeEach(() => {
		window.scrollTo = vi.fn();
	});

	it("scrolls to the top when the path changes", async () => {
		render(
			<MemoryRouter>
				<ScrollToTop />
				<Link to="/projects">Go</Link>
			</MemoryRouter>
		);
		await userEvent.click(screen.getByRole("link", { name: "Go" }));
		expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
	});

	it("does not scroll when only the hash changes", async () => {
		render(
			<MemoryRouter>
				<ScrollToTop />
				<Link to="/#section">Jump</Link>
			</MemoryRouter>
		);
		(window.scrollTo as ReturnType<typeof vi.fn>).mockClear();
		await userEvent.click(screen.getByRole("link", { name: "Jump" }));
		expect(window.scrollTo).not.toHaveBeenCalled();
	});
});
