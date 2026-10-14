import { localizeProject } from "../data/localize";
import { projects } from "../data/projects";
import {
	DEFAULT_LOCALE,
	LOCALES,
	OG_LOCALE,
	alternates,
	localizedPath,
	translate,
	type Locale,
} from "../i18n";
import { jsonLdFor, serializeJsonLd } from "./jsonLd";
import { SITE_NAME, pageMeta, type PageMeta, type Route } from "./pages";
import { absoluteUrl } from "./site";

const escape = (text: string) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

/** `<link rel="alternate" hreflang>` for each language, plus `x-default` (English). */
function hreflangLinks(meta: PageMeta, siteUrl: string): string[] {
	const pages = meta.alternates;
	if (!pages) return [];
	const link = (hreflang: string, path: string) =>
		`<link rel="alternate" hreflang="${hreflang}" href="${absoluteUrl(siteUrl, path)}" />`;
	return [
		...LOCALES.map((locale) => link(locale, pages[locale])),
		link("x-default", pages[DEFAULT_LOCALE]),
	];
}

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
		...hreflangLinks(meta, siteUrl),
		`<meta property="og:type" content="website" />`,
		`<meta property="og:site_name" content="${SITE_NAME}" />`,
		`<meta property="og:title" content="${title}" />`,
		`<meta property="og:description" content="${description}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${image}" />`,
		`<meta property="og:image:width" content="1200" />`,
		`<meta property="og:image:height" content="630" />`,
		`<meta property="og:image:alt" content="${escape(meta.imageAlt)}" />`,
		`<meta property="og:locale" content="${OG_LOCALE[meta.locale]}" />`,
		...LOCALES.filter((l) => l !== meta.locale && meta.alternates).map(
			(l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`
		),
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
	const { locale } = meta;
	const home = localizedPath(locale, "/");
	const projectsPath = localizedPath(locale, "/projects");
	return `<noscript><main><h1>${escape(meta.heading)}</h1><p>${escape(meta.description)}</p><nav><a href="${home}">${translate(locale, "seo.noscript.home")}</a> <a href="${projectsPath}">${translate(locale, "seo.noscript.projects")}</a></nav></main></noscript>`;
}

/**
 * Fills the `seo:head` and `seo:noscript` markers of the page template, keeping the
 * markers, and sets the page's language on `<html>`.
 */
export function fillTemplate(
	html: string,
	parts: { head: string; noscript: string; locale?: Locale }
): string {
	let out = html.replace(
		/<html lang="[^"]*"/,
		`<html lang="${parts.locale ?? DEFAULT_LOCALE}"`
	);
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

/**
 * The pages the build writes besides the English home page (the root `index.html`),
 * with the route and language each one stands for. The design system is English only.
 */
export function emittedPages(): {
	fileName: string;
	route: Route;
	locale: Locale;
}[] {
	const inLanguage = (locale: Locale) => {
		const dir = locale === DEFAULT_LOCALE ? "" : `${locale}/`;
		const pages: { fileName: string; route: Route; locale: Locale }[] = [
			{
				fileName: `${dir}projects/index.html`,
				route: { name: "projects" },
				locale,
			},
			...projects.map((project) => ({
				fileName: `${dir}projects/${project.slug}/index.html`,
				route: {
					name: "project",
					project: localizeProject(project, locale),
				} as Route,
				locale,
			})),
		];
		if (locale !== DEFAULT_LOCALE) {
			pages.unshift({
				fileName: `${dir}index.html`,
				route: { name: "home" },
				locale,
			});
		}
		return pages;
	};
	return [
		...LOCALES.flatMap(inLanguage),
		{
			fileName: "design-system/index.html",
			route: { name: "design-system" },
			locale: DEFAULT_LOCALE,
		},
	];
}

export function robotsTxt(siteUrl: string): string {
	return `User-agent: *\nAllow: /\nDisallow: /design-system\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

/** The pages worth indexing, in every language, each listing its translations. */
export function sitemapXml(siteUrl: string, lastmod: string): string {
	const paths = [
		"/",
		"/projects",
		...projects.map((project) => `/projects/${project.slug}`),
	];
	const entries = paths
		.flatMap((path) => {
			const versions = alternates(path);
			const links = [
				...LOCALES.map(
					(locale) =>
						`\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${absoluteUrl(siteUrl, versions[locale])}" />`
				),
				`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(siteUrl, versions[DEFAULT_LOCALE])}" />`,
			].join("\n");
			return LOCALES.map(
				(locale) =>
					`\t<url>\n\t\t<loc>${absoluteUrl(siteUrl, versions[locale])}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n${links}\n\t</url>`
			);
		})
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`;
}

function pageHtml(
	template: string,
	route: Route,
	siteUrl: string,
	locale: Locale = DEFAULT_LOCALE
): string {
	const meta = pageMeta(route, locale);
	return fillTemplate(template, {
		head: renderHead(meta, siteUrl, jsonLdFor(route, siteUrl, locale)),
		noscript: renderNoscript(meta),
		locale,
	});
}

/** The page template with the home page's head and fallback filled in. */
export function homePage(template: string, siteUrl: string): string {
	return pageHtml(template, { name: "home" }, siteUrl);
}

/**
 * Every file the build adds next to `index.html`: one page per route and language (the
 * same scripts and styles, its own head) plus `robots.txt` and `sitemap.xml`.
 */
export function buildSiteFiles(
	template: string,
	siteUrl: string,
	lastmod: string
): { fileName: string; source: string }[] {
	return [
		...emittedPages().map(({ fileName, route, locale }) => ({
			fileName,
			source: pageHtml(template, route, siteUrl, locale),
		})),
		{ fileName: "robots.txt", source: robotsTxt(siteUrl) },
		{ fileName: "sitemap.xml", source: sitemapXml(siteUrl, lastmod) },
	];
}
