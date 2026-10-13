import { describe, it, expect } from "vitest";
import { getProject, projects } from "./projects";

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

	it("includes a project with no credits and no gallery", () => {
		expect(
			projects.some((p) => p.credits.length === 0 && p.gallery.length === 0)
		).toBe(true);
	});

	it("finds a project by slug", () => {
		expect(getProject(projects[0].slug)).toBe(projects[0]);
	});

	it("returns undefined for an unknown slug", () => {
		expect(getProject("nope")).toBeUndefined();
	});
});
