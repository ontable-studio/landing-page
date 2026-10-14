import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { LanguageSwitcher } from "./LanguageSwitcher";

function Where() {
	const { pathname, search } = useLocation();
	return <p data-testid="where">{pathname + search}</p>;
}

function at(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<LanguageSwitcher />
			<Where />
		</MemoryRouter>
	);
}

describe("LanguageSwitcher", () => {
	it("is a labelled group with one link per language", () => {
		at("/projects");
		const group = screen.getByRole("group", { name: "Language" });
		expect(group).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "English" })).toHaveTextContent(
			"EN"
		);
		expect(
			screen.getByRole("link", { name: "Bahasa Indonesia" })
		).toHaveTextContent("ID");
	});

	it("leads to the same page in the other language, keeping the query string", () => {
		at("/projects?type=game");
		expect(
			screen.getByRole("link", { name: "Bahasa Indonesia" })
		).toHaveAttribute("href", "/id/projects?type=game");
		expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
			"href",
			"/projects?type=game"
		);
	});

	it("goes the other way from an Indonesian page", () => {
		at("/id/projects/ketik-mancing");
		expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
			"href",
			"/projects/ketik-mancing"
		);
	});

	it("handles the home page of each language", () => {
		const { unmount } = at("/");
		expect(
			screen.getByRole("link", { name: "Bahasa Indonesia" })
		).toHaveAttribute("href", "/id");
		unmount();
		at("/id");
		expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
			"href",
			"/"
		);
	});

	it("marks the language being shown as current, and only that one", () => {
		at("/id/projects");
		expect(
			screen.getByRole("link", { name: "Bahasa Indonesia" })
		).toHaveAttribute("aria-current", "true");
		expect(screen.getByRole("link", { name: "English" })).not.toHaveAttribute(
			"aria-current"
		);
	});

	it("tells assistive technology and search engines each link's language", () => {
		at("/projects");
		const id = screen.getByRole("link", { name: "Bahasa Indonesia" });
		expect(id).toHaveAttribute("lang", "id");
		expect(id).toHaveAttribute("hreflang", "id");
		const en = screen.getByRole("link", { name: "English" });
		expect(en).toHaveAttribute("lang", "en");
		expect(en).toHaveAttribute("hreflang", "en");
	});

	it("switches inside the app, without a page load", async () => {
		at("/projects?type=game");
		await userEvent.click(
			screen.getByRole("link", { name: "Bahasa Indonesia" })
		);
		expect(screen.getByTestId("where")).toHaveTextContent(
			"/id/projects?type=game"
		);
	});

	it("is not shown on the design system, which has only English", () => {
		at("/design-system");
		expect(
			screen.queryByRole("group", { name: "Language" })
		).not.toBeInTheDocument();
	});

	it("reacts to hover and keyboard focus like the other chips", () => {
		at("/projects");
		const other = screen.getByRole("link", { name: "Bahasa Indonesia" });
		expect(other.className).toContain("hover:bg-surface");
		expect(other.className).toContain("focus-visible:bg-surface");
		expect(other.className).toContain("focus-visible:outline-brand");
	});
});
