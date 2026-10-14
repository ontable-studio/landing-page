import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";

/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
	if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
	let offset = 2;
	while (offset < bytes.length) {
		if (bytes[offset] !== 0xff) return null;
		const marker = bytes[offset + 1];
		const length = bytes.readUInt16BE(offset + 2);
		if (
			marker >= 0xc0 &&
			marker <= 0xcf &&
			![0xc4, 0xc8, 0xcc].includes(marker)
		) {
			return {
				height: bytes.readUInt16BE(offset + 5),
				width: bytes.readUInt16BE(offset + 7),
			};
		}
		offset += 2 + length;
	}
	return null;
}

const previews = ["default", ...projects.map((p) => p.slug)];

describe("preview images", () => {
	it.each(previews)(
		"public/og/%s.jpg is a 1200x630 JPEG under 200 KB",
		(name) => {
			const path = `public/og/${name}.jpg`;
			expect(existsSync(path), path).toBe(true);
			const bytes = readFileSync(path);
			expect(jpegSize(bytes)).toEqual({ width: 1200, height: 630 });
			expect(bytes.length).toBeLessThan(200 * 1024);
		}
	);
});

describe("vercel.json", () => {
	const config = JSON.parse(readFileSync("vercel.json", "utf8")) as {
		rewrites?: unknown;
		headers: { source: string; headers: { key: string; value: string }[] }[];
	};
	const cache = (source: string) =>
		config.headers
			.find((h) => h.source === source)
			?.headers.find((h) => h.key === "Cache-Control")?.value;

	it("caches hashed assets for a year, immutable", () => {
		expect(cache("/assets/(.*)")).toBe("public, max-age=31536000, immutable");
	});

	it("caches pictures and preview images for a week", () => {
		expect(cache("/images/(.*)")).toBe("public, max-age=604800");
		expect(cache("/og/(.*)")).toBe("public, max-age=604800");
	});

	it("has no rewrites, so an unknown path stays a real 404", () => {
		expect(config.rewrites).toBeUndefined();
	});
});

describe("site files", () => {
	it("names the web manifest after the studio", () => {
		const manifest = JSON.parse(
			readFileSync("public/site.webmanifest", "utf8")
		);
		expect(manifest.name).toBe("OnTable Studio");
		expect(manifest.short_name).toBe("OnTable");
		expect(String(manifest.description)).toMatch(/game/i);
	});

	it("documents VITE_SITE_URL in .env.example", () => {
		expect(readFileSync(".env.example", "utf8")).toMatch(/^VITE_SITE_URL=/m);
	});

	it("keeps the 404 page out of search results", () => {
		expect(readFileSync("public/404.html", "utf8")).toMatch(
			/<meta name="robots" content="noindex"/
		);
	});
});
