import { describe, expect, it } from "vitest";
import { projectTextsId } from "./projects.id";
import { localizeProject, localizedProjects, typeLabel } from "./localize";
import { projects } from "./projects";

const craftboard = projects.find((p) => p.slug === "craftboard-heroes")!;
const ketik = projects.find((p) => p.slug === "ketik-mancing")!;

describe("Indonesian project texts", () => {
	it("cover every project, with every gallery picture described", () => {
		expect(Object.keys(projectTextsId).sort()).toEqual(
			projects.map((p) => p.slug).sort()
		);
		for (const p of projects) {
			const text = projectTextsId[p.slug];
			expect(text.summary.trim(), p.slug).not.toBe("");
			expect(text.category.trim(), p.slug).not.toBe("");
			expect(text.galleryAlts, p.slug).toHaveLength(p.gallery.length);
			for (const alt of text.galleryAlts)
				expect(alt.trim(), p.slug).not.toBe("");
		}
	});

	it("are real translations, not copies of the English", () => {
		for (const p of projects) {
			expect(projectTextsId[p.slug].summary, p.slug).not.toBe(p.summary);
			for (const [i, alt] of projectTextsId[p.slug].galleryAlts.entries()) {
				expect(alt, `${p.slug} #${i}`).not.toBe(p.gallery[i].alt);
			}
		}
	});
});

describe("localizeProject", () => {
	it("leaves English exactly as it is", () => {
		expect(localizeProject(craftboard, "en")).toEqual(craftboard);
	});

	it("swaps in the Indonesian summary, genre and picture descriptions", () => {
		const out = localizeProject(craftboard, "id");
		expect(out.summary).toBe(projectTextsId["craftboard-heroes"].summary);
		expect(out.category).toBe("Aksi");
		expect(out.gallery.map((g) => g.alt)).toEqual(
			projectTextsId["craftboard-heroes"].galleryAlts
		);
	});

	it("keeps everything that is not language: names, files, platforms, roles, year, links", () => {
		const out = localizeProject(craftboard, "id");
		expect(out.slug).toBe(craftboard.slug);
		expect(out.title).toBe("Craftboard Heroes");
		expect(out.type).toBe(craftboard.type);
		expect(out.year).toBe(craftboard.year);
		expect(out.image).toBe(craftboard.image);
		expect(out.links).toEqual(craftboard.links);
		expect(out.gallery.map((g) => g.src)).toEqual(
			craftboard.gallery.map((g) => g.src)
		);
		const value = (label: string) =>
			out.credits.find((c) => c.label === label)?.value;
		expect(value("Platform")).toBe("WebGL (HTML), Desktop");
		expect(value("Peran")).toBe("Game Design, Programming, Art (2D/3D)");
		expect(value("Tanggal")).toBe("2026");
		expect(value("Dibuat untuk")).toBe("Game jam");
	});

	it("translates the credit labels", () => {
		const labels = localizeProject(craftboard, "id").credits.map(
			(c) => c.label
		);
		expect(labels).toEqual(["Tanggal", "Peran", "Platform", "Dibuat untuk"]);
	});

	it("translates the development status in the pill and in the credits", () => {
		const out = localizeProject(ketik, "id");
		expect(out.status).toBe("Sedang dikembangkan");
		expect(out.credits.find((c) => c.label === "Status")?.value).toBe(
			"Sedang dikembangkan"
		);
	});

	it("does not touch the original project", () => {
		const before = JSON.stringify(craftboard);
		localizeProject(craftboard, "id");
		expect(JSON.stringify(craftboard)).toBe(before);
	});
});

describe("localizedProjects", () => {
	it("lists every project in the language, in the same order", () => {
		const list = localizedProjects("id");
		expect(list.map((p) => p.slug)).toEqual(projects.map((p) => p.slug));
		expect(list[0].category).toBe("Aksi");
		expect(localizedProjects("en")[0].category).toBe(projects[0].category);
	});
});

describe("typeLabel", () => {
	it("names each project type in the language", () => {
		expect(typeLabel("en", "UI Design")).toBe("UI Design");
		expect(typeLabel("id", "UI Design")).toBe("Desain UI");
		expect(typeLabel("id", "Tool")).toBe("Alat");
		expect(typeLabel("id", "Game")).toBe("Game");
	});
});
