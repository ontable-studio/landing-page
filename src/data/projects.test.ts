import { existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
	PROJECT_TYPES,
	getProject,
	nextProject,
	projectTypes,
	projects,
} from "./projects";

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

	const credit = (slug: string, label: string) =>
		getProject(slug)?.credits.find((c) => c.label === label)?.value;

	it("lists WebGL (HTML) and Desktop for Craftboard Heroes, and Desktop only for the rest", () => {
		expect(credit("craftboard-heroes", "Platform")).toBe(
			"WebGL (HTML), Desktop"
		);
		for (const slug of ["ketik-mancing", "laundry-kita", "oxshiftgen"]) {
			expect(credit(slug, "Platform"), slug).toBe("Desktop");
		}
	});

	it("shows the same role on every project", () => {
		for (const p of projects) {
			expect(credit(p.slug, "Role"), p.slug).toBe(
				"Game Design, Programming, Art (2D/3D)"
			);
		}
	});

	it("has the confirmed years, and marks Ketik Mancing as in development", () => {
		expect(getProject("craftboard-heroes")?.year).toBe(2026);
		expect(getProject("laundry-kita")?.year).toBe(2025);
		expect(getProject("oxshiftgen")?.year).toBe(2026);
		expect(getProject("ketik-mancing")?.year).toBeUndefined();
		expect(getProject("ketik-mancing")?.status).toBe("In development");
		expect(credit("ketik-mancing", "Status")).toBe("In development");
	});

	it("lists the year as the Date credit where there is one", () => {
		for (const p of projects.filter((p) => p.year !== undefined)) {
			expect(credit(p.slug, "Date"), p.slug).toBe(String(p.year));
		}
	});

	it("marks only Craftboard Heroes and OxShiftGen as game jam entries", () => {
		for (const p of projects) {
			const jam = ["craftboard-heroes", "oxshiftgen"].includes(p.slug);
			expect(credit(p.slug, "Made for"), p.slug).toBe(
				jam ? "Game jam" : undefined
			);
		}
	});

	it("links the two game jam entries to their itch.io pages, and nothing else", () => {
		expect(getProject("craftboard-heroes")?.links).toEqual([
			{
				label: "Play on itch.io",
				href: "https://ontable-studio.itch.io/craftboard-heroes",
			},
		]);
		expect(getProject("oxshiftgen")?.links).toEqual([
			{
				label: "Play on itch.io",
				href: "https://ontable-studio.itch.io/oxshiftgen",
			},
		]);
		expect(getProject("ketik-mancing")?.links ?? []).toEqual([]);
		expect(getProject("laundry-kita")?.links ?? []).toEqual([]);
	});

	it("only links to https pages, each with a label", () => {
		for (const p of projects) {
			for (const link of p.links ?? []) {
				expect(link.label.trim()).not.toBe("");
				expect(link.href).toMatch(/^https:\/\//);
			}
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

	it("picks the next project, looping from the last back to the first", () => {
		expect(nextProject(projects[0].slug)).toBe(projects[1]);
		expect(nextProject(projects[projects.length - 1].slug)).toBe(projects[0]);
	});

	it("has no next project for an unknown slug", () => {
		expect(nextProject("nope")).toBeUndefined();
	});

	it("finds a project by slug", () => {
		expect(getProject(projects[0].slug)).toBe(projects[0]);
	});

	it("returns undefined for an unknown slug", () => {
		expect(getProject("nope")).toBeUndefined();
	});
});
