import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const html = readFileSync("index.html", "utf8");

describe("index.html first paint", () => {
	it("declares a light colour scheme so no dark canvas shows", () => {
		expect(html).toMatch(/<meta\s+name="color-scheme"\s+content="light"/);
	});

	it("paints html and body white with no margin before any CSS loads", () => {
		const style = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
		expect(style).toMatch(/html,\s*body/);
		expect(style).toMatch(/margin:\s*0/);
		expect(style).toMatch(/background:\s*#fff/);
	});

	it("puts the inline style before the app script", () => {
		expect(html.indexOf("<style>")).toBeGreaterThan(-1);
		expect(html.indexOf("<style>")).toBeLessThan(html.indexOf("<script"));
	});
});
