import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import DesignSystem from "./DesignSystem";
import { colorGroups, typeScale } from "./design-system/tokens.data";

describe("DesignSystem page", () => {
	it("renders the five section headings", () => {
		render(<DesignSystem />);
		for (const name of [
			"Colours",
			"Typography",
			"Spacing and radius",
			"Motion",
			"Components",
		]) {
			expect(
				screen.getByRole("heading", { level: 2, name })
			).toBeInTheDocument();
		}
	});

	it("has a section nav linking to each section", () => {
		render(<DesignSystem />);
		const nav = screen.getByRole("navigation", { name: "Sections" });
		const hrefs = within(nav)
			.getAllByRole("link")
			.map((a) => a.getAttribute("href"));
		expect(hrefs).toEqual([
			"#colours",
			"#typography",
			"#spacing",
			"#motion",
			"#components",
		]);
	});

	it("sticks its section nav to the top, now that the site nav scrolls away", () => {
		render(<DesignSystem />);
		const cls = screen.getByRole("navigation", { name: "Sections" }).className;
		expect(cls).toMatch(/sticky top-0/);
		expect(cls).not.toMatch(/top-16/);
	});

	it("shows every colour token", () => {
		render(<DesignSystem />);
		for (const group of colorGroups) {
			for (const swatch of group.swatches) {
				expect(screen.getByText(swatch.token)).toBeInTheDocument();
			}
		}
	});

	it("shows one specimen per type scale step", () => {
		render(<DesignSystem />);
		for (const step of typeScale) {
			expect(screen.getByTestId(`type-${step.token}`)).toBeInTheDocument();
		}
	});

	it("shows every Button variant", () => {
		render(<DesignSystem />);
		for (const variant of ["primary", "outline", "ghost", "link"]) {
			expect(screen.getByTestId(`button-${variant}`)).toBeInTheDocument();
		}
	});
});

describe("tokens.data", () => {
	it("has valid hex values and the brand orange", () => {
		const all = colorGroups.flatMap((g) => g.swatches);
		for (const s of all) expect(s.hex).toMatch(/^#[0-9a-f]{6}$/i);
		expect(all.find((s) => s.token === "orange-500")?.hex).toBe("#f5611f");
	});
});
