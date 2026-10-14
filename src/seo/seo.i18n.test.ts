import { describe, expect, it } from "vitest";
import { localizeProject } from "../data/localize";
import { projects } from "../data/projects";
import { jsonLdFor } from "./jsonLd";
import { pageMeta } from "./pages";
import {
	buildSiteFiles,
	emittedPages,
	fillTemplate,
	renderHead,
	renderNoscript,
	sitemapXml,
} from "./render";

const URL = "https://example.test";
const ketik = projects.find((p) => p.slug === "ketik-mancing")!;
const idProject = localizeProject(ketik, "id");

describe("pageMeta in Indonesian", () => {
	it("gives the home page an Indonesian title, description and /id path", () => {
		const meta = pageMeta({ name: "home" }, "id");
		expect(meta.title).toBe("OnTable Studio: tim kecil pengembang game");
		expect(meta.description).toContain("Craftboard Heroes");
		expect(meta.description).toContain(" dan ");
		expect(meta.path).toBe("/id");
		expect(meta.locale).toBe("id");
		expect(meta.heading).toBe(
			"Kami membuat game dari meja kami, untuk meja Anda."
		);
	});

	it("localizes the projects page and a project page", () => {
		expect(pageMeta({ name: "projects" }, "id").path).toBe("/id/projects");
		const meta = pageMeta({ name: "project", project: idProject }, "id");
		expect(meta.path).toBe("/id/projects/ketik-mancing");
		expect(meta.description).toContain("Game memancing");
		expect(meta.image).toBe("/og/ketik-mancing.jpg");
		expect(meta.imageAlt).toBe("Sampul Ketik Mancing");
	});

	it("lists the other language of each indexable page, and x-default as English", () => {
		const meta = pageMeta({ name: "projects" }, "id");
		expect(meta.alternates).toEqual({ en: "/projects", id: "/id/projects" });
		expect(pageMeta({ name: "home" }, "en").alternates).toEqual({
			en: "/",
			id: "/id",
		});
	});

	it("has no alternates on pages that are not indexed", () => {
		expect(
			pageMeta({ name: "design-system" }, "en").alternates
		).toBeUndefined();
		expect(pageMeta({ name: "not-found" }, "id").alternates).toBeUndefined();
	});

	it("leaves English exactly as before", () => {
		expect(pageMeta({ name: "home" }).path).toBe("/");
		expect(pageMeta({ name: "home" }).locale).toBe("en");
	});
});

describe("renderHead", () => {
	it("writes hreflang links, og:locale and its alternates", () => {
		const head = renderHead(pageMeta({ name: "projects" }, "id"), URL, []);
		expect(head).toContain(
			`<link rel="alternate" hreflang="en" href="${URL}/projects" />`
		);
		expect(head).toContain(
			`<link rel="alternate" hreflang="id" href="${URL}/id/projects" />`
		);
		expect(head).toContain(
			`<link rel="alternate" hreflang="x-default" href="${URL}/projects" />`
		);
		expect(head).toContain(
			`<link rel="canonical" href="${URL}/id/projects" />`
		);
		expect(head).toContain(`<meta property="og:locale" content="id_ID" />`);
		expect(head).toContain(
			`<meta property="og:locale:alternate" content="en_US" />`
		);
	});

	it("keeps English at en_US with an Indonesian alternate", () => {
		const head = renderHead(pageMeta({ name: "home" }), URL, []);
		expect(head).toContain(`content="en_US"`);
		expect(head).toContain(`property="og:locale:alternate" content="id_ID"`);
	});

	it("writes no hreflang on pages without alternates", () => {
		const head = renderHead(pageMeta({ name: "design-system" }), URL, []);
		expect(head).not.toContain("hreflang");
	});
});

describe("renderNoscript and the template", () => {
	it("links home and projects in the page's language", () => {
		const html = renderNoscript(pageMeta({ name: "home" }, "id"));
		expect(html).toContain(`<a href="/id">Beranda</a>`);
		expect(html).toContain(`<a href="/id/projects">Proyek</a>`);
	});

	it("sets the html lang", () => {
		const template = `<html lang="en"><!-- seo:head --><!-- /seo:head --><!-- seo:noscript --><!-- /seo:noscript --></html>`;
		const out = fillTemplate(template, {
			head: "",
			noscript: "",
			locale: "id",
		});
		expect(out).toContain(`<html lang="id">`);
	});
});

describe("emitted pages and sitemap", () => {
	it("emits every page in both languages", () => {
		const files = emittedPages().map((p) => p.fileName);
		expect(files).toContain("id/index.html");
		expect(files).toContain("id/projects/index.html");
		expect(files).toContain("id/projects/ketik-mancing/index.html");
		expect(files).toContain("projects/ketik-mancing/index.html");
		expect(files).toContain("design-system/index.html");
		expect(files).not.toContain("id/design-system/index.html");
	});

	it("writes the Indonesian page with its own head and lang", () => {
		const template = `<html lang="en"><head><!-- seo:head --><!-- /seo:head --></head><body><!-- seo:noscript --><!-- /seo:noscript --></body></html>`;
		const page = buildSiteFiles(template, URL, "2026-10-14").find(
			(f) => f.fileName === "id/projects/ketik-mancing/index.html"
		)!;
		expect(page.source).toContain(`<html lang="id">`);
		expect(page.source).toContain("Game memancing");
		expect(page.source).toContain(
			`hreflang="en" href="${URL}/projects/ketik-mancing"`
		);
	});

	it("lists both languages in the sitemap, each with its alternates", () => {
		const xml = sitemapXml(URL, "2026-10-14");
		expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
		expect(xml).toContain(`<loc>${URL}/id/projects/ketik-mancing</loc>`);
		expect(xml).toContain(
			`<xhtml:link rel="alternate" hreflang="id" href="${URL}/id" />`
		);
		expect(xml).toContain(
			`<xhtml:link rel="alternate" hreflang="en" href="${URL}/" />`
		);
	});
});

describe("jsonLdFor in Indonesian", () => {
	it("uses the /id addresses and Indonesian names", () => {
		const [game, crumbs] = jsonLdFor(
			{ name: "project", project: idProject },
			URL,
			"id"
		) as Record<string, unknown>[];
		expect(game.url).toBe(`${URL}/id/projects/ketik-mancing`);
		expect(game.inLanguage).toBe("id");
		const items = (
			crumbs.itemListElement as { name: string; item: string }[]
		).map((c) => [c.name, c.item]);
		expect(items).toEqual([
			["Beranda", `${URL}/id`],
			["Proyek", `${URL}/id/projects`],
			["Ketik Mancing", `${URL}/id/projects/ketik-mancing`],
		]);
	});

	it("points the Indonesian home to the Indonesian site", () => {
		const [org, site] = jsonLdFor({ name: "home" }, URL, "id") as Record<
			string,
			unknown
		>[];
		expect(org.url).toBe(URL);
		expect(site.url).toBe(`${URL}/id`);
		expect(site.inLanguage).toBe("id");
	});
});
