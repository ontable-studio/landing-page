import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { buildSiteFiles, homePage } from "./render";

const SITE = "https://example.test";
const template = readFileSync("index.html", "utf8");
const count = (text: string, pattern: RegExp) =>
	text.match(pattern)?.length ?? 0;

describe("index.html template", () => {
	it("carries the head and noscript markers the build fills", () => {
		expect(template).toContain("<!-- seo:head -->");
		expect(template).toContain("<!-- /seo:head -->");
		expect(template).toContain("<!-- seo:noscript -->");
		expect(template).toContain("<!-- /seo:noscript -->");
	});

	it("keeps the markers inside the head and the body, in that order", () => {
		const headOpen = template.indexOf("<head>");
		const headClose = template.indexOf("</head>");
		const marker = template.indexOf("<!-- seo:head -->");
		const noscript = template.indexOf("<!-- seo:noscript -->");
		const app = template.indexOf('<div id="app">');
		expect(marker).toBeGreaterThan(headOpen);
		expect(marker).toBeLessThan(headClose);
		expect(noscript).toBeGreaterThan(template.indexOf("<body>"));
		expect(noscript).toBeLessThan(app);
	});

	it("does not repeat a title, description or icon outside the markers", () => {
		const outside = template.replace(
			/<!-- seo:head -->[\s\S]*?<!-- \/seo:head -->/,
			""
		);
		expect(outside).not.toMatch(/<title>/);
		expect(outside).not.toMatch(/name="description"/);
		expect(outside).not.toMatch(/rel="icon"/);
	});
});

describe("homePage", () => {
	it("fills the home head and keeps the app and its scripts", () => {
		const html = homePage(template, SITE);
		expect(count(html, /<title>/g)).toBe(1);
		expect(html).toContain(
			"<title>OnTable Studio: a small game development team</title>"
		);
		expect(html).toContain(
			'<link rel="canonical" href="https://example.test/" />'
		);
		expect(html).toContain('<div id="app"></div>');
		expect(html).toContain("<noscript>");
	});
});

describe("buildSiteFiles", () => {
	const files = buildSiteFiles(homePage(template, SITE), SITE, "2026-10-14");
	const file = (name: string) =>
		files.find((f) => f.fileName === name)?.source ?? "";

	it("writes a page for the projects, every project and the design system, plus robots and sitemap", () => {
		expect(files.map((f) => f.fileName)).toEqual([
			"projects/index.html",
			...projects.map((p) => `projects/${p.slug}/index.html`),
			"design-system/index.html",
			"robots.txt",
			"sitemap.xml",
		]);
	});

	it("gives each page exactly one title, description and canonical of its own", () => {
		for (const f of files.filter((f) => f.fileName.endsWith(".html"))) {
			expect(count(f.source, /<title>/g), f.fileName).toBe(1);
			expect(count(f.source, /name="description"/g), f.fileName).toBe(1);
			expect(count(f.source, /rel="canonical"/g), f.fileName).toBe(1);
			expect(f.source).toContain('<div id="app"></div>');
		}
	});

	it("points every project page at its own address and title", () => {
		for (const p of projects) {
			const html = file(`projects/${p.slug}/index.html`);
			expect(html).toContain(`<title>${p.title} — OnTable Studio</title>`);
			expect(html).toContain(
				`rel="canonical" href="https://example.test/projects/${p.slug}"`
			);
			expect(html).toContain(`<h1>${p.title}</h1>`);
			expect(html).toContain('"@type":"VideoGame"');
		}
	});

	it("marks the design system noindex and leaves it out of the sitemap", () => {
		expect(file("design-system/index.html")).toContain(
			'<meta name="robots" content="noindex, nofollow" />'
		);
		expect(file("sitemap.xml")).not.toContain("design-system");
		expect(file("robots.txt")).toContain("Disallow: /design-system");
	});

	it("keeps the home page's JSON-LD off the other pages", () => {
		expect(file("projects/index.html")).not.toContain('"@type":"Organization"');
		expect(file("projects/index.html")).toContain('"@type":"CollectionPage"');
	});
});
