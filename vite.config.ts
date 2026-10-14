import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { FONT_TARGETS, fontPreloadTags } from "./src/common/preloadFonts";
import { buildSiteFiles, homePage } from "./src/seo/render";
import { resolveSiteUrl } from "./src/seo/site";

// Dev serves the font files straight from node_modules, without a hash.
const DEV_FONT_PATHS = [
	"/node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2",
	"/node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2",
];

/**
 * Preloads the first-screen fonts so the page does not show a fallback face
 * and then swap to the real one.
 */
function preloadFonts(): Plugin {
	const inject = (html: string, tags: string[]) =>
		tags.length
			? html.replace("</head>", `\t${tags.join("\n\t")}\n\t</head>`)
			: html;

	return {
		name: "preload-fonts",
		transformIndexHtml: {
			order: "post",
			handler(html, ctx) {
				if (ctx.server) {
					return inject(
						html,
						DEV_FONT_PATHS.map(
							(path) =>
								`<link rel="preload" href="${path}" as="font" type="font/woff2" crossorigin>`
						)
					);
				}
				return inject(
					html,
					fontPreloadTags(Object.keys(ctx.bundle ?? {}), FONT_TARGETS)
				);
			},
		},
	};
}

/**
 * Writes each page's own head into the HTML (title, description, canonical, Open
 * Graph, JSON-LD) so crawlers and link previews see it without running JavaScript:
 * the home page in `index.html`, and one `index.html` per route next to it, plus
 * `robots.txt` and `sitemap.xml`. Works from the markers in the root `index.html`.
 */
function seo(siteUrl: string): Plugin {
	return {
		name: "seo",
		transformIndexHtml: {
			order: "pre",
			handler: (html) => homePage(html, siteUrl),
		},
		generateBundle: {
			order: "post",
			handler(_options, bundle) {
				const index = bundle["index.html"];
				if (index?.type !== "asset") return;
				const lastmod = new Date().toISOString().slice(0, 10);
				for (const file of buildSiteFiles(
					String(index.source),
					siteUrl,
					lastmod
				)) {
					this.emitFile({
						type: "asset",
						fileName: file.fileName,
						source: file.source,
					});
				}
			},
		},
	};
}

// The preview tool assigns a free port through PORT; plain `npm run dev` keeps Vite's default.
const port = process.env.PORT ? Number(process.env.PORT) : undefined;

export default defineConfig(({ mode }) => {
	const siteUrl = resolveSiteUrl({
		VITE_SITE_URL: loadEnv(mode, process.cwd(), "").VITE_SITE_URL,
		VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
	});
	return {
		plugins: [react(), tailwindcss(), preloadFonts(), seo(siteUrl)],
		define: { __SITE_URL__: JSON.stringify(siteUrl) },
		server: { port, strictPort: port !== undefined },
	};
});
