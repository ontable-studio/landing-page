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
		"@utility cut-corner",
	])("defines %s", (token) => {
		expect(css.toLowerCase()).toContain(token.toLowerCase());
	});

	it("has no component layer", () => {
		expect(css).not.toContain("@layer components");
	});

	it("has no blue", () => {
		expect(css.toLowerCase()).not.toMatch(/blue/);
	});
});
