import { SITE } from "../common/constants";
import { projects } from "../data/projects";
import { SITE_NAME, pageMeta, type Route } from "./pages";
import { absoluteUrl } from "./site";

type JsonLd = Record<string, unknown>;

const CONTEXT = "https://schema.org";
const LOGO = "/web-app-manifest-512x512.png";

const organization = (siteUrl: string): JsonLd => ({
	"@type": "Organization",
	name: SITE_NAME,
	url: siteUrl,
	logo: absoluteUrl(siteUrl, LOGO),
	email: SITE.email,
	sameAs: SITE.social.map((link) => link.href),
});

/** Structured data for a page, using only facts the project data holds. */
export function jsonLdFor(route: Route, siteUrl: string): JsonLd[] {
	switch (route.name) {
		case "home":
			return [
				{ "@context": CONTEXT, ...organization(siteUrl) },
				{
					"@context": CONTEXT,
					"@type": "WebSite",
					name: SITE_NAME,
					url: siteUrl,
				},
			];
		case "projects":
			return [
				{
					"@context": CONTEXT,
					"@type": "CollectionPage",
					name: pageMeta(route).title,
					url: absoluteUrl(siteUrl, "/projects"),
					mainEntity: {
						"@type": "ItemList",
						itemListElement: projects.map((project, index) => ({
							"@type": "ListItem",
							position: index + 1,
							name: project.title,
							url: absoluteUrl(siteUrl, `/projects/${project.slug}`),
						})),
					},
				},
			];
		case "project": {
			const { project } = route;
			const url = absoluteUrl(siteUrl, `/projects/${project.slug}`);
			const platform = project.credits.find((c) => c.label === "Platform");
			const links = (project.links ?? []).map((link) => link.href);
			const game: JsonLd = {
				"@context": CONTEXT,
				"@type": "VideoGame",
				name: project.title,
				description: project.summary,
				url,
				genre: project.category,
				applicationCategory: "Game",
				author: organization(siteUrl),
			};
			if (project.image) game.image = absoluteUrl(siteUrl, project.image);
			if (platform) {
				game.gamePlatform = platform.value.split(",").map((p) => p.trim());
			}
			if (project.year !== undefined) game.datePublished = String(project.year);
			if (links.length > 0) game.sameAs = links;
			return [
				game,
				{
					"@context": CONTEXT,
					"@type": "BreadcrumbList",
					itemListElement: [
						{ name: "Home", item: absoluteUrl(siteUrl, "/") },
						{ name: "Projects", item: absoluteUrl(siteUrl, "/projects") },
						{ name: project.title, item: url },
					].map((crumb, index) => ({
						"@type": "ListItem",
						position: index + 1,
						...crumb,
					})),
				},
			];
		}
		default:
			return [];
	}
}

/** JSON for a `<script type="application/ld+json">`, safe against a `</script>` in the data. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
