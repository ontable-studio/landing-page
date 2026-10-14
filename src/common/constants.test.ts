import { describe, expect, it } from "vitest";
import { SITE } from "./constants";

describe("SITE", () => {
	it("has the studio's real contact email", () => {
		expect(SITE.email).toBe("ontablestudio@gmail.com");
	});

	it("links the studio's Instagram and itch.io, in that order", () => {
		expect(SITE.social).toEqual([
			{ label: "Instagram", href: "https://www.instagram.com/ontable.games/" },
			{ label: "itch.io", href: "https://ontable-studio.itch.io/" },
		]);
	});

	it("has no placeholder values left", () => {
		const text = JSON.stringify(SITE);
		expect(text).not.toMatch(/example\.com|TODO/i);
		expect(text).not.toContain('"https://itch.io"');
	});

	it("keeps the tagline and its lines in step", () => {
		expect(SITE.taglineLines.join(" ")).toBe(SITE.tagline);
	});
});
