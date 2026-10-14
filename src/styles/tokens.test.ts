import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync("src/styles/main.css", "utf8");

describe("main.css tokens", () => {
	it.each([
		"--color-brand:",
		"--color-orange-500: #f5611f",
		"--color-ink-900:",
		"--font-display:",
		"--text-display:",
		"--text-h2:",
		"--spacing-section:",
		"--spacing-section-lg:",
		"--animate-rise:",
		"--animate-rise-quick:",
		"--animate-line-rise:",
		"--animate-settle:",
		"@utility cut-corner",
	])("defines %s", (token) => {
		expect(css.toLowerCase()).toContain(token.toLowerCase());
	});

	it("has no component layer", () => {
		expect(css).not.toContain("@layer components");
	});

	it("uses Poppins for display, with no leftover Blippo", () => {
		expect(css).toMatch(/--font-display: "Poppins"/);
		expect(css.toLowerCase()).not.toContain("blippo");
		expect(css).toContain("poppins-latin-700-normal.woff2");
	});

	it("gives every heading step a bold weight", () => {
		for (const step of ["display", "h1", "h2", "h3", "h4"]) {
			expect(css).toMatch(new RegExp(`--text-${step}--font-weight: 7\\d\\d`));
		}
	});

	it("only cuts motion for reduced-motion visitors when html opts in", () => {
		const block = css.slice(css.indexOf("@media (prefers-reduced-motion"));
		expect(block).toContain("html[data-respect-reduced-motion]");
		expect(block).toContain("::view-transition-group(*)");
		expect(block).toContain("animation-delay: 0s");
		expect(block).toContain("animation-duration: 0.01ms");
	});

	it("keeps the page itself still during a view transition, so only named cards animate", () => {
		expect(css).toContain("::view-transition-old(root)");
		expect(css).toContain("::view-transition-new(root)");
	});

	it("starts the headline lines low enough to stay hidden behind the taller mask", () => {
		const block = css.slice(css.indexOf("@keyframes line-rise"));
		expect(block.slice(0, 120)).toContain("translate: 0 130%");
	});

	it("has no blue", () => {
		expect(css.toLowerCase()).not.toMatch(/blue/);
	});
});
