import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { FONT_TARGETS, fontPreloadTags } from "./src/common/preloadFonts";

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

export default defineConfig({
	plugins: [react(), tailwindcss(), preloadFonts()],
});
