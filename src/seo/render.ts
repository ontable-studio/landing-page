import { projects } from "../data/projects";
import { serializeJsonLd } from "./jsonLd";
import { SITE_NAME, type PageMeta, type Route } from "./pages";
import { absoluteUrl } from "./site";

const escape = (text: string) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

/** The tags that go inside `<head>` for one page. */
export function renderHead(
	meta: PageMeta,
	siteUrl: string,
	jsonLd: object[]
): string {
	const url = absoluteUrl(siteUrl, meta.path);
	const image = absoluteUrl(siteUrl, meta.image);
	const title = escape(meta.title);
	const description = escape(meta.description);
	const lines = [
		`<title>${title}</title>`,
		`<meta name="description" content="${description}" />`,
		`<meta name="robots" content="${meta.robots}" />`,
		`<link rel="canonical" href="${url}" />`,
		`<meta property="og:type" content="website" />`,
		`<meta property="og:site_name" content="${SITE_NAME}" />`,
		`<meta property="og:title" content="${title}" />`,
		`<meta property="og:description" content="${description}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${image}" />`,
		`<meta property="og:image:width" content="1200" />`,
		`<meta property="og:image:height" content="630" />`,
		`<meta property="og:image:alt" content="${escape(meta.imageAlt)}" />`,
		`<meta property="og:locale" content="en_US" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${title}" />`,
		`<meta name="twitter:description" content="${description}" />`,
		`<meta name="twitter:image" content="${image}" />`,
		`<meta name="twitter:image:alt" content="${escape(meta.imageAlt)}" />`,
		`<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
		`<link rel="icon" href="/favicon.ico" sizes="48x48" />`,
		`<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
		`<link rel="manifest" href="/site.webmanifest" />`,
		...jsonLd.map(
			(data) =>
				`<script type="application/ld+json">${serializeJsonLd(data)}</script>`
		),
	];
	return lines.join("\n\t\t");
}

/** What a visitor without JavaScript (or a crawler that does not run it) gets in the body. */
export function renderNoscript(meta: PageMeta): string {
	return `<noscript><main><h1>${escape(meta.heading)}</h1><p>${escape(meta.description)}</p><nav><a href="/">Home</a> <a href="/projects">Projects</a></nav></main></noscript>`;
}

/** Fills the `seo:head` and `seo:noscript` markers of the page template, keeping the markers. */
export function fillTemplate(
	html: string,
	parts: { head: string; noscript: string }
): string {
	let out = html;
	for (const [name, content] of [
		["head", parts.head],
		["noscript", parts.noscript],
	] as const) {
		const pattern = new RegExp(
			`(<!-- seo:${name} -->)[\\s\\S]*?(<!-- /seo:${name} -->)`
		);
		if (!pattern.test(out)) {
			throw new Error(`index.html is missing the <!-- seo:${name} --> markers`);
		}
		out = out.replace(
			pattern,
			(_all, open, close) => `${open}${content}${close}`
		);
	}
	return out;
}

/** The pages the build writes besides the home page, with the route each one stands for. */
export function emittedPages(): { fileName: string; route: Route }[] {
	return [
		{ fileName: "projects/index.html", route: { name: "projects" } },
		...projects.map((project) => ({
			fileName: `projects/${project.slug}/index.html`,
			route: { name: "project", project } as Route,
		})),
		{ fileName: "design-system/index.html", route: { name: "design-system" } },
	];
}

export function robotsTxt(siteUrl: string): string {
	return `User-agent: *\nAllow: /\nDisallow: /design-system\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/** The pages worth indexing: home, projects and every project. */
export function sitemapXml(siteUrl: string, lastmod: string): string {
	const paths = [
		"/",
		"/projects",
		...projects.map((project) => `/projects/${project.slug}`),
	];
	const entries = paths
		.map(
			(path) =>
				`\t<url>\n\t\t<loc>${absoluteUrl(siteUrl, path)}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t</url>`
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
