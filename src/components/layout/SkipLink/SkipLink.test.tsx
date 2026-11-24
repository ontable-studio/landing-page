import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
	it("links to #main-content in the active language", () => {
		const { unmount } = render(
			<MemoryRouter initialEntries={["/"]}>
				<SkipLink />
			</MemoryRouter>
		);
		expect(
			screen.getByRole("link", { name: "Skip to main content" })
		).toHaveAttribute("href", "#main-content");
		unmount();

		render(
			<MemoryRouter initialEntries={["/id"]}>
				<SkipLink />
			</MemoryRouter>
		);
		expect(
			screen.getByRole("link", { name: "Langsung ke konten utama" })
		).toHaveAttribute("href", "#main-content");
	});
});
