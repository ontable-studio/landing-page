import { afterEach, describe, expect, it, vi } from "vitest";
import { canTrack, easeToward, normalize } from "./glow";

function stubMedia(matches: Record<string, boolean>) {
	vi.stubGlobal(
		"matchMedia",
		(query: string) =>
			({
				matches: matches[query] ?? false,
				media: query,
			}) as MediaQueryList
	);
}

afterEach(() => {
	vi.unstubAllGlobals();
	document.documentElement.removeAttribute("data-respect-reduced-motion");
});

describe("easeToward", () => {
	it("moves a fraction of the way to the target", () => {
		expect(easeToward(0, 100, 0.25)).toBe(25);
	});

	it("lands exactly on the target once it is close enough", () => {
		expect(easeToward(99.95, 100, 0.25)).toBe(100);
	});

	it("moves backwards too", () => {
		expect(easeToward(100, 0, 0.5)).toBe(50);
	});
});

describe("normalize", () => {
	it("maps the edges to -1 and 1 and the middle to 0", () => {
		expect(normalize(0, 200)).toBe(-1);
		expect(normalize(100, 200)).toBe(0);
		expect(normalize(200, 200)).toBe(1);
	});

	it("clamps values outside the box", () => {
		expect(normalize(-50, 200)).toBe(-1);
		expect(normalize(500, 200)).toBe(1);
	});

	it("returns 0 for an empty box", () => {
		expect(normalize(10, 0)).toBe(0);
	});
});

describe("canTrack", () => {
	it("is true with a fine hovering pointer and no reduced-motion request", () => {
		stubMedia({ "(hover: hover) and (pointer: fine)": true });
		expect(canTrack()).toBe(true);
	});

	it("is false on touch devices", () => {
		stubMedia({});
		expect(canTrack()).toBe(false);
	});

	it("ignores a reduced-motion request by default", () => {
		stubMedia({
			"(hover: hover) and (pointer: fine)": true,
			"(prefers-reduced-motion: reduce)": true,
		});
		expect(canTrack()).toBe(true);
	});

	it("honors a reduced-motion request once html opts in", () => {
		document.documentElement.setAttribute("data-respect-reduced-motion", "");
		stubMedia({
			"(hover: hover) and (pointer: fine)": true,
			"(prefers-reduced-motion: reduce)": true,
		});
		expect(canTrack()).toBe(false);
	});

	it("is false where matchMedia does not exist", () => {
		vi.stubGlobal("matchMedia", undefined);
		expect(canTrack()).toBe(false);
	});
});
