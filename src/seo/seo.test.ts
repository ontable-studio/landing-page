import { describe, expect, it } from "vitest";
import { SITE as STUDIO } from "../common/constants";
import { projects } from "../data/projects";
import { serializeJsonLd, jsonLdFor } from "./jsonLd";
import { pageMeta, truncate, SITE_NAME, type Route } from "./pages";
import {
	emittedPages,
	fillTemplate,
	renderHead,
	renderNoscript,
	robotsTxt,
	sitemapXml,
} from "./render";
import { DEFAULT_SITE_URL, absoluteUrl, resolveSiteUrl } from "./site";

const SITE = "https://example.test";
const craftboard = projects.find((p) => p.slug === "craftboard-heroes")!;
const ketik = projects.find((p) => p.slug === "ketik-mancing")!;

describe("resolveSiteUrl", () => {
	it("prefers VITE_SITE_URL, then the Vercel production host, then the default", () => {
		expect(
			resolveSiteUrl({
				VITE_SITE_URL: "https://a.test",
				VERCEL_PROJECT_PRODUCTION_URL: "b.test",
			})
		).toBe("https://a.test");
		expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "b.test" })).toBe(
			"https://b.test"
		);
		expect(resolveSiteUrl({})).toBe(DEFAULT_SITE_URL);
		expect(DEFAULT_SITE_URL).toBe("https://landing-page-ontable.vercel.app");
	});

	it("drops trailing slashes and adds https when the protocol is missing", () => {
		expect(resolveSiteUrl({ VITE_SITE_URL: "https://a.test///" })).toBe(
			"https://a.test"
		);
		expect(resolveSiteUrl({ VITE_SITE_URL: "a.test" })).toBe("https://a.test");
	});

	it("ignores blank values", () => {
		expect(
			resolveSiteUrl({ VITE_SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "" })
		).toBe(DEFAULT_SITE_URL);
	});
});

describe("absoluteUrl", () => {
	it("joins the site and a path with exactly one slash", () => {
		expect(absoluteUrl(SITE, "/projects")).toBe(
			"https://example.test/projects"
		);
		expect(absoluteUrl(SITE, "projects")).toBe("https://example.test/projects");
		expect(absoluteUrl(SITE, "/")).toBe("https://example.test/");
	});
});

describe("truncate", () => {
	it("leaves short text alone", () => {
		expect(truncate("Short text.", 155)).toBe("Short text.");
	});

	it("cuts long text at a word boundary and adds an ellipsis, within the limit", () => {
		const long = "word ".repeat(80).trim();
		const out = truncate(long, 40);
		expect(out.length).toBeLessThanOrEqual(40);
		expect(out.endsWith("…")).toBe(true);
		expect(out).not.toMatch(/\s…$/);
		expect(long.startsWith(out.slice(0, -1))).toBe(true);
	});
});

describe("pageMeta", () => {
	const routes: Route[] = [
		{ name: "home" },
		{ name: "projects" },
		...projects.map((project) => ({ name: "project" as const, project })),
		{ name: "design-system" },
		{ name: "not-found" },
	];

	it("gives every page a distinct title and a description of sensible length", () => {
		const titles = routes.map((r) => pageMeta(r).title);
		expect(new Set(titles).size).toBe(titles.length);
		for (const route of routes) {
			const meta = pageMeta(route);
			expect(meta.title.length, meta.title).toBeLessThanOrEqual(65);
			expect(meta.description.length, meta.title).toBeGreaterThanOrEqual(50);
			expect(meta.description.length, meta.title).toBeLessThanOrEqual(160);
			expect(meta.title).toContain(SITE_NAME.split(" ")[0]);
		}
	});

	it("names the studio and the games on the home page", () => {
		const meta = pageMeta({ name: "home" });
		expect(meta.title).toBe("OnTable Studio: a small game development team");
		expect(meta.path).toBe("/");
		expect(meta.robots).toBe("index, follow");
		for (const p of projects) expect(meta.description).toContain(p.title);
	});

	it("lists the projects on the projects page", () => {
		const meta = pageMeta({ name: "projects" });
		expect(meta.title).toBe("Projects — OnTable Studio");
		expect(meta.path).toBe("/projects");
		for (const p of projects) expect(meta.description).toContain(p.title);
	});

	it("builds a project page from its title, summary and its own preview image", () => {
		const meta = pageMeta({ name: "project", project: craftboard });
		expect(meta.title).toBe("Craftboard Heroes — OnTable Studio");
		expect(meta.path).toBe("/projects/craftboard-heroes");
		expect(meta.description).toBe(truncate(craftboard.summary, 155));
		expect(meta.image).toBe("/og/craftboard-heroes.jpg");
		expect(meta.robots).toBe("index, follow");
	});

	it("keeps the design system and the not-found page out of search results", () => {
		expect(pageMeta({ name: "design-system" }).robots).toBe(
			"noindex, nofollow"
		);
		expect(pageMeta({ name: "not-found" }).robots).toBe("noindex, nofollow");
	});

	it("uses the default preview image outside the project pages", () => {
		for (const name of [
			"home",
			"projects",
			"design-system",
			"not-found",
		] as const) {
			expect(pageMeta({ name }).image).toBe("/og/default.jpg");
		}
	});
});

describe("jsonLdFor", () => {
	const types = (objects: object[]) =>
		objects.map((o) => (o as { "@type": string })["@type"]);

	it("describes the organization and the website on the home page", () => {
		const data = jsonLdFor({ name: "home" }, SITE);
		expect(types(data)).toEqual(["Organization", "WebSite"]);
		const org = data[0] as Record<string, unknown>;
		expect(org.name).toBe("OnTable Studio");
		expect(org.url).toBe(SITE);
		expect(String(org.logo)).toMatch(/^https:\/\/example\.test\/.+\.png$/);
		expect(org.email).toBe(STUDIO.email);
		expect(org.sameAs).toEqual(STUDIO.social.map((s) => s.href));
	});

	it("lists every project in order on the projects page", () => {
		const [page] = jsonLdFor({ name: "projects" }, SITE) as Array<{
			"@type": string;
			mainEntity: {
				itemListElement: Array<{ position: number; url: string; name: string }>;
			};
		}>;
		expect(page["@type"]).toBe("CollectionPage");
		const items = page.mainEntity.itemListElement;
		expect(items.map((i) => i.name)).toEqual(projects.map((p) => p.title));
		expect(items.map((i) => i.position)).toEqual(projects.map((_, i) => i + 1));
		expect(items[0].url).toBe(
			"https://example.test/projects/craftboard-heroes"
		);
	});

	it("describes a project as a VideoGame with only the facts it has", () => {
		const [game, crumbs] = jsonLdFor(
			{ name: "project", project: craftboard },
			SITE
		) as Array<Record<string, unknown>>;
		expect(game["@type"]).toBe("VideoGame");
		expect(game.name).toBe("Craftboard Heroes");
		expect(game.url).toBe("https://example.test/projects/craftboard-heroes");
		expect(game.image).toBe(
			"https://example.test/images/projects/craftboard-heroes/01-title.webp"
		);
		expect(game.genre).toBe("Action");
		expect(game.gamePlatform).toEqual(["WebGL (HTML)", "Desktop"]);
		expect(game.datePublished).toBe("2026");
		expect(game.sameAs).toEqual([
			"https://ontable-studio.itch.io/craftboard-heroes",
		]);
		expect(crumbs["@type"]).toBe("BreadcrumbList");
	});

	it("leaves out the date and links a project does not have", () => {
		const [game] = jsonLdFor(
			{ name: "project", project: ketik },
			SITE
		) as Array<Record<string, unknown>>;
		expect(game.datePublished).toBeUndefined();
		expect(game.sameAs).toBeUndefined();
		expect(game.gamePlatform).toEqual(["Desktop"]);
	});

	it("walks Home, Projects and the project in the breadcrumb", () => {
		const crumbs = jsonLdFor(
			{ name: "project", project: craftboard },
			SITE
		)[1] as {
			itemListElement: Array<{ position: number; name: string; item: string }>;
		};
		expect(crumbs.itemListElement.map((c) => c.name)).toEqual([
			"Home",
			"Projects",
			"Craftboard Heroes",
		]);
		expect(crumbs.itemListElement[2].item).toBe(
			"https://example.test/projects/craftboard-heroes"
		);
	});

	it("has no structured data for the design system or a missing page", () => {
		expect(jsonLdFor({ name: "design-system" }, SITE)).toEqual([]);
		expect(jsonLdFor({ name: "not-found" }, SITE)).toEqual([]);
	});
});

describe("serializeJsonLd", () => {
	it("cannot close the script tag from inside the data", () => {
		const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
		expect(out).not.toContain("</script>");
		expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
	});
});

describe("renderHead", () => {
	const meta = pageMeta({ name: "project", project: craftboard });
	const head = renderHead(
		meta,
		SITE,
		jsonLdFor({ name: "project", project: craftboard }, SITE)
	);

	it("has the title, description, robots and canonical", () => {
		expect(head).toContain(`<title>${meta.title}</title>`);
		expect(head).toContain(
			`<meta name="description" content="${meta.description.replace(/&/g, "&amp;")}"`
		);
		expect(head).toContain('<meta name="robots" content="index, follow"');
		expect(head).toContain(
			'<link rel="canonical" href="https://example.test/projects/craftboard-heroes"'
		);
	});

	it("has Open Graph and Twitter tags with an absolute preview image", () => {
		for (const tag of [
			'property="og:type" content="website"',
			'property="og:site_name" content="OnTable Studio"',
			`property="og:title" content="${meta.title}"`,
			'property="og:url" content="https://example.test/projects/craftboard-heroes"',
			'property="og:image" content="https://example.test/og/craftboard-heroes.jpg"',
			'property="og:image:width" content="1200"',
			'property="og:image:height" content="630"',
			'property="og:locale" content="en_US"',
			'name="twitter:card" content="summary_large_image"',
			'name="twitter:image" content="https://example.test/og/craftboard-heroes.jpg"',
		]) {
			expect(head, tag).toContain(tag);
		}
	});

	it("has the icons, the manifest and the JSON-LD", () => {
		expect(head).toContain('rel="icon" href="/favicon.svg"');
		expect(head).toContain('rel="apple-touch-icon"');
		expect(head).toContain('rel="manifest" href="/site.webmanifest"');
		expect(head).toContain('<script type="application/ld+json">');
	});

	it("escapes quotes and angle brackets in the text", () => {
		const out = renderHead(
			{
				...meta,
				title: 'A "quoted" <b>title</b>',
				description: 'Say "hi" & <go>',
			},
			SITE,
			[]
		);
		expect(out).not.toContain("<b>");
		expect(out).toContain("&quot;quoted&quot;");
		expect(out).toContain("&amp;");
	});
});

describe("renderNoscript", () => {
	it("gives a crawler without JavaScript a heading, the summary and links", () => {
		const meta = pageMeta({ name: "project", project: craftboard });
		const html = renderNoscript(meta);
		expect(html).toContain("<noscript>");
		expect(html).toContain("<h1>Craftboard Heroes</h1>");
		expect(html).toContain(meta.description);
		expect(html).toContain('href="/"');
		expect(html).toContain('href="/projects"');
	});
});

describe("fillTemplate", () => {
	const template = [
		"<html><head>",
		'<!-- seo:head --><title>Old</title><meta name="description" content="Old" /><!-- /seo:head -->',
		"</head><body>",
		"<!-- seo:noscript --><!-- /seo:noscript -->",
		'<div id="app"></div></body></html>',
	].join("\n");

	it("replaces what sits between the markers and keeps the markers", () => {
		const out = fillTemplate(template, {
			head: "<title>New</title>",
			noscript: "<noscript>x</noscript>",
		});
		expect(out).toContain("<title>New</title>");
		expect(out).not.toContain("<title>Old</title>");
		expect(out.match(/<title>/g)).toHaveLength(1);
		expect(out).toContain("<noscript>x</noscript>");
		expect(out).toContain("<!-- seo:head -->");
		expect(out).toContain("<!-- /seo:noscript -->");
	});

	it("can be filled again, so every page starts from the same template", () => {
		const once = fillTemplate(template, {
			head: "<title>One</title>",
			noscript: "",
		});
		const twice = fillTemplate(once, {
			head: "<title>Two</title>",
			noscript: "",
		});
		expect(twice).toContain("<title>Two</title>");
		expect(twice).not.toContain("<title>One</title>");
	});

	it("fails loudly when the markers are missing", () => {
		expect(() =>
			fillTemplate("<html></html>", { head: "", noscript: "" })
		).toThrow(/seo:head/);
	});
});

describe("emittedPages", () => {
	it("lists a file for the projects page and every project in each language, the Indonesian home and the design system", () => {
		const files = emittedPages().map((p) => p.fileName);
		expect(files).toEqual([
			"projects/index.html",
			...projects.map((p) => `projects/${p.slug}/index.html`),
			"id/index.html",
			"id/projects/index.html",
			...projects.map((p) => `id/projects/${p.slug}/index.html`),
			"design-system/index.html",
		]);
	});
});

describe("robotsTxt and sitemapXml", () => {
	it("allows crawling, hides the design system and points at the sitemap", () => {
		const text = robotsTxt(SITE);
		expect(text).toContain("User-agent: *");
		expect(text).toContain("Allow: /");
		expect(text).toContain("Disallow: /design-system");
		expect(text).toContain("Sitemap: https://example.test/sitemap.xml");
	});

	it("lists home, projects and every project, and leaves out the design system", () => {
		const xml = sitemapXml(SITE, "2026-10-14");
		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(xml).toContain("<loc>https://example.test/</loc>");
		expect(xml).toContain("<loc>https://example.test/projects</loc>");
		for (const p of projects) {
			expect(xml).toContain(
				`<loc>https://example.test/projects/${p.slug}</loc>`
			);
		}
		expect(xml).not.toContain("design-system");
		expect(xml.match(/<lastmod>2026-10-14<\/lastmod>/g)).toHaveLength(
			(projects.length + 2) * 2
		);
	});
});
