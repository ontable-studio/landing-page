import { SITE } from "../common/constants";
import { projects, type Project } from "../data/projects";

export const SITE_NAME = "OnTable Studio";

export type Route =
	| { name: "home" }
	| { name: "projects" }
	| { name: "project"; project: Project }
	| { name: "design-system" }
	| { name: "not-found" };

export interface PageMeta {
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

/** "A, B and C". */
function list(names: string[]): string {
	if (names.length < 2) return names.join("");
	return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
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

/** Title, description, robots and image for one page. The only place these are decided. */
export function pageMeta(route: Route): PageMeta {
	const names = projects.map((project) => project.title);
	switch (route.name) {
		case "home":
			return {
				title: `${SITE_NAME}: a small game development team`,
				description: `${SITE_NAME} is a small team making games, products and projects. See ${list(names)}.`,
				heading: SITE.tagline,
				path: "/",
				robots: "index, follow",
				image: DEFAULT_IMAGE,
				imageAlt: `${SITE_NAME}: ${SITE.tagline}`,
			};
		case "projects":
			return {
				title: `Projects — ${SITE_NAME}`,
				description: `Games and projects by ${SITE_NAME}: ${list(names)}.`,
				heading: "Projects",
				path: "/projects",
				robots: "index, follow",
				image: DEFAULT_IMAGE,
				imageAlt: `${SITE_NAME} projects`,
			};
		case "project":
			return {
				title: `${route.project.title} — ${SITE_NAME}`,
				description: truncate(route.project.summary, 155),
				heading: route.project.title,
				path: `/projects/${route.project.slug}`,
				robots: "index, follow",
				image: `/og/${route.project.slug}.jpg`,
				imageAlt: `${route.project.title} cover`,
			};
		case "design-system":
			return {
				title: `Design System — ${SITE_NAME}`,
				description: `Colours, type, spacing and components used on the ${SITE_NAME} site.`,
				heading: "Design System",
				path: "/design-system",
				robots: "noindex, nofollow",
				image: DEFAULT_IMAGE,
				imageAlt: SITE_NAME,
			};
		case "not-found":
			return {
				title: `Page not found — ${SITE_NAME}`,
				description: `This page does not exist. Go back to the ${SITE_NAME} home page or browse the projects.`,
				heading: "Page not found",
				path: "/",
				robots: "noindex, nofollow",
				image: DEFAULT_IMAGE,
				imageAlt: SITE_NAME,
			};
	}
}
