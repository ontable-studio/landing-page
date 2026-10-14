import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { PROJECT_TYPES, getProject, projectTypes, projects } from "./projects";

describe("projects data", () => {
	it("has at least three projects", () => {
		expect(projects.length).toBeGreaterThanOrEqual(3);
	});

	it("uses unique kebab-case slugs", () => {
		const slugs = projects.map((p) => p.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const slug of slugs) {
			expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
		}
	});

	it("gives every project a title and a summary", () => {
		for (const p of projects) {
			expect(p.title.trim()).not.toBe("");
			expect(p.summary.trim()).not.toBe("");
		}
	});

	it("has no placeholder projects left", () => {
		for (const p of projects) {
			expect(`${p.title} ${p.summary}`).not.toMatch(/placeholder/i);
		}
	});

	it("gives every project a cover, and every picture exists in public/", () => {
		for (const p of projects) {
			expect(p.image, p.slug).toBeTruthy();
			const files = [p.image, ...p.gallery.map((g) => g.src)].filter(Boolean);
			for (const file of files) {
				expect(file).toMatch(/^\/images\/projects\/.+\.webp$/);
				expect(existsSync(`public${file}`), file).toBe(true);
			}
		}
	});

	it("describes every gallery picture", () => {
		for (const p of projects) {
			for (const item of p.gallery) expect(item.alt.trim()).not.toBe("");
		}
	});

	it("only fills in a year that is a four-digit year", () => {
		for (const p of projects) {
			if (p.year !== undefined) expect(p.year).toBeGreaterThan(1999);
		}
	});

	it("lists WebGL (HTML) and Desktop for Craftboard Heroes only", () => {
		const platformOf = (slug: string) =>
			getProject(slug)?.credits.find((c) => c.label === "Platform")?.value ??
			"";
		expect(platformOf("craftboard-heroes")).toBe("WebGL (HTML), Desktop");
		for (const p of projects.filter((p) => p.slug !== "craftboard-heroes")) {
			expect(platformOf(p.slug)).not.toMatch(/webgl|desktop/i);
		}
	});

	it("includes the four showcase games", () => {
		expect(projects.map((p) => p.slug)).toEqual([
			"craftboard-heroes",
			"ketik-mancing",
			"laundry-kita",
			"oxshiftgen",
		]);
	});

	it("gives every project a known type", () => {
		for (const p of projects) expect(PROJECT_TYPES).toContain(p.type);
	});

	it("lists the types in use once each, in order of first appearance", () => {
		expect(projectTypes).toEqual([...new Set(projects.map((p) => p.type))]);
	});

	it("finds a project by slug", () => {
		expect(getProject(projects[0].slug)).toBe(projects[0]);
	});

	it("returns undefined for an unknown slug", () => {
		expect(getProject("nope")).toBeUndefined();
	});
});
