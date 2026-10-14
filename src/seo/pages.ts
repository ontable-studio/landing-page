import { localizedProjects } from "../data/localize";
import { type Project } from "../data/projects";
import {
	DEFAULT_LOCALE,
	alternates,
	localizedPath,
	tagline,
	translate,
	type Locale,
	type TextKey,
	type TextVars,
} from "../i18n";

export const SITE_NAME = "OnTable Studio";

export type Route =
	| { name: "home" }
	| { name: "projects" }
	| { name: "project"; project: Project }
	| { name: "design-system" }
	| { name: "not-found" };

export interface PageMeta {
	/** The language the page is written in. */
	locale: Locale;
	/** The same page in each language, for `hreflang`; left out where the page is not indexed. */
	alternates?: Record<Locale, string>;
	title: string;
	description: string;
	/** What the page's `h1` says (used by the no-JavaScript fallback). */
	heading: string;
	/** The page's address on the site, starting with `/`. */
	path: string;
	robots: "index, follow" | "noindex, nofollow";
	/** Preview image for social cards, as a path on the site. */
	image: string;
	imageAlt: string;
}

const DEFAULT_IMAGE = "/og/default.jpg";

/** "A, B and C" (or "A, B dan C"). */
function list(names: string[], and: string): string {
	if (names.length < 2) return names.join("");
	return `${names.slice(0, -1).join(", ")} ${and} ${names[names.length - 1]}`;
}

/** Cuts `text` to at most `max` characters at a word boundary, with an ellipsis. */
export function truncate(text: string, max = 155): string {
	if (text.length <= max) return text;
	const cut = text.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(" ");
	const base = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(
		/[\s,.;:–—-]+$/,
		""
	);
	return `${base}…`;
}

/**
 * Title, description, robots and image for one page, in `locale`. The only place these
 * are decided. A project route carries the project already in that language.
 */
export function pageMeta(
	route: Route,
	locale: Locale = DEFAULT_LOCALE
): PageMeta {
	const t = (key: TextKey, vars?: TextVars) => translate(locale, key, vars);
	const games = list(
		localizedProjects(locale).map((project) => project.title),
		t("seo.list.and")
	);
	const line = tagline(locale);
	const page = (path: string, indexed = true) => ({
		locale,
		path: localizedPath(locale, path),
		alternates: indexed ? alternates(path) : undefined,
	});

	switch (route.name) {
		case "home":
			return {
				title: t("seo.home.title"),
				description: t("seo.home.description", { games }),
				heading: line,
				...page("/"),
				robots: "index, follow",
				image: DEFAULT_IMAGE,
				imageAlt: t("seo.imageAlt.home", { tagline: line }),
			};
		case "projects":
			return {
				title: t("seo.projects.title"),
				description: t("seo.projects.description", { games }),
				heading: t("projects.title"),
				...page("/projects"),
				robots: "index, follow",
				image: DEFAULT_IMAGE,
				imageAlt: t("seo.imageAlt.projects"),
			};
		case "project":
			return {
				title: t("seo.project.title", { title: route.project.title }),
				description: truncate(route.project.summary, 155),
				heading: route.project.title,
				...page(`/projects/${route.project.slug}`),
				robots: "index, follow",
				image: `/og/${route.project.slug}.jpg`,
				imageAlt: t("seo.imageAlt.project", { title: route.project.title }),
			};
		case "design-system":
			return {
				title: t("seo.designSystem.title"),
				description: t("seo.designSystem.description"),
				heading: "Design System",
				...page("/design-system", false),
				robots: "noindex, nofollow",
				image: DEFAULT_IMAGE,
				imageAlt: SITE_NAME,
			};
		case "not-found":
			return {
				title: t("seo.notFound.title"),
				description: t("seo.notFound.description"),
				heading: t("notFound.title"),
				...page("/", false),
				robots: "noindex, nofollow",
				image: DEFAULT_IMAGE,
				imageAlt: SITE_NAME,
			};
	}
}
