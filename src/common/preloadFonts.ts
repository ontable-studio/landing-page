/** Font files the first screen needs: the display face and the body face. */
export const FONT_TARGETS = [
	"poppins-latin-700-normal",
	"instrument-sans-latin-wght-normal",
];

/** `<link rel="preload">` tags for the built font files that match `targets`. */
export function fontPreloadTags(files: string[], targets: string[]): string[] {
	return files
		.filter((file) => file.endsWith(".woff2"))
		.filter((file) => targets.some((target) => file.includes(target)))
		.map(
			(file) =>
				`<link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin>`
		);
}
