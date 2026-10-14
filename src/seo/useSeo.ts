import { useEffect } from "react";
import { LOCALES, OG_LOCALE, DEFAULT_LOCALE, useLocale } from "../i18n";
import { serializeJsonLd, jsonLdFor } from "./jsonLd";
import { pageMeta, type Route } from "./pages";
import { DEFAULT_SITE_URL, absoluteUrl } from "./site";

/** Replaced at build time by the Vite config with the resolved site address. */
declare const __SITE_URL__: string | undefined;
const siteUrl =
	typeof __SITE_URL__ === "string" ? __SITE_URL__ : DEFAULT_SITE_URL;

/** Finds the tag that `selector` matches in `<head>`, or makes it. */
function tag(selector: string, create: () => HTMLElement): HTMLElement {
	let element = document.head.querySelector<HTMLElement>(selector);
	if (!element) {
		element = create();
		document.head.append(element);
	}
	return element;
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
	tag(`meta[${attribute}="${key}"]`, () => {
		const meta = document.createElement("meta");
		meta.setAttribute(attribute, key);
		return meta;
	}).setAttribute("content", value);
}

/**
 * Keeps the document head right for the current page: the title, description,
 * robots, canonical, Open Graph and Twitter tags, and the JSON-LD. The build
 * already writes these into each page's HTML; this keeps them right when a visitor
 * navigates inside the app (search engines that run JavaScript read them too).
 */
export function useSeo(route: Route): void {
	const locale = useLocale();
	const key =
		route.name === "project" ? `project:${route.project.slug}` : route.name;

	useEffect(() => {
		const meta = pageMeta(route, locale);
		const url = absoluteUrl(siteUrl, meta.path);
		const image = absoluteUrl(siteUrl, meta.image);

		document.documentElement.lang = locale;
		document.title = meta.title;
		setMeta("name", "description", meta.description);
		setMeta("name", "robots", meta.robots);
		tag('link[rel="canonical"]', () => {
			const link = document.createElement("link");
			link.rel = "canonical";
			return link;
		}).setAttribute("href", url);

		document.head
			.querySelectorAll('link[rel="alternate"][hreflang]')
			.forEach((link) => link.remove());
		const pages = meta.alternates;
		if (pages) {
			for (const [hreflang, path] of [
				...LOCALES.map((l) => [l, pages[l]] as const),
				["x-default", pages[DEFAULT_LOCALE]] as const,
			]) {
				const link = document.createElement("link");
				link.rel = "alternate";
				link.hreflang = hreflang;
				link.href = absoluteUrl(siteUrl, path);
				document.head.append(link);
			}
		}

		setMeta("property", "og:type", "website");
		setMeta("property", "og:locale", OG_LOCALE[locale]);
		setMeta("property", "og:title", meta.title);
		setMeta("property", "og:description", meta.description);
		setMeta("property", "og:url", url);
		setMeta("property", "og:image", image);
		setMeta("property", "og:image:alt", meta.imageAlt);
		setMeta("name", "twitter:card", "summary_large_image");
		setMeta("name", "twitter:title", meta.title);
		setMeta("name", "twitter:description", meta.description);
		setMeta("name", "twitter:image", image);

		document.head
			.querySelectorAll('script[type="application/ld+json"]')
			.forEach((script) => script.remove());
		for (const data of jsonLdFor(route, siteUrl, locale)) {
			const script = document.createElement("script");
			script.type = "application/ld+json";
			script.textContent = serializeJsonLd(data);
			document.head.append(script);
		}
		// `route` is rebuilt every render; `key` says when the page really changed.
	}, [key, locale]);
}
