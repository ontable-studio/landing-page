import { describe, it, expect } from "vitest";
import { FONT_TARGETS, fontPreloadTags } from "./preloadFonts";

describe("fontPreloadTags", () => {
	const files = [
		"assets/index-abc.js",
		"assets/poppins-latin-700-normal-Qrb0O0WB.woff2",
		"assets/instrument-sans-latin-wght-normal-xyz.woff2",
		"assets/ibm-plex-mono-latin-400-normal-123.woff2",
		"assets/poppins-latin-700-normal-Qrb0O0WB.woff",
	];

	it("preloads only the fonts the first screen uses", () => {
		const tags = fontPreloadTags(files, FONT_TARGETS);
		expect(tags).toHaveLength(2);
		expect(tags.join("")).toContain("poppins-latin-700-normal");
		expect(tags.join("")).toContain("instrument-sans-latin-wght-normal");
		expect(tags.join("")).not.toContain("ibm-plex-mono");
	});

	it("skips non-woff2 files", () => {
		expect(fontPreloadTags(files, FONT_TARGETS).join("")).not.toContain(
			'.woff"'
		);
	});

	it("writes a font preload with crossorigin and an absolute path", () => {
		const [tag] = fontPreloadTags(
			["assets/poppins-latin-700-normal-Q.woff2"],
			FONT_TARGETS
		);
		expect(tag).toBe(
			'<link rel="preload" href="/assets/poppins-latin-700-normal-Q.woff2" as="font" type="font/woff2" crossorigin>'
		);
	});

	it("returns nothing when no font matches", () => {
		expect(fontPreloadTags(["assets/index.js"], FONT_TARGETS)).toEqual([]);
	});
});
