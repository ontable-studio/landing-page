import { describe, expect, it } from "vitest";
import { en } from "./en";
import { id } from "./id";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "./locales";
import { alternates, localizedPath, splitLocale, switchPath } from "./paths";
import { headlineLines, tagline, translate } from "./translate";

describe("locales", () => {
	it("are English (the default) and Indonesian", () => {
		expect([...LOCALES]).toEqual(["en", "id"]);
		expect(DEFAULT_LOCALE).toBe("en");
	});

	it("recognises only supported locale codes", () => {
		expect(isLocale("en")).toBe(true);
		expect(isLocale("id")).toBe(true);
		expect(isLocale("fr")).toBe(false);
		expect(isLocale("idea")).toBe(false);
	});
});

describe("localizedPath", () => {
	it("leaves English paths as they are", () => {
		expect(localizedPath("en", "/")).toBe("/");
		expect(localizedPath("en", "/projects")).toBe("/projects");
	});

	it("puts Indonesian pages under /id", () => {
		expect(localizedPath("id", "/")).toBe("/id");
		expect(localizedPath("id", "/projects")).toBe("/id/projects");
		expect(localizedPath("id", "/projects/oxshiftgen")).toBe(
			"/id/projects/oxshiftgen"
		);
	});

	it("does not stack a prefix on a path that already has one", () => {
		expect(localizedPath("id", "/id/projects")).toBe("/id/projects");
		expect(localizedPath("en", "/id/projects")).toBe("/projects");
	});
});

describe("splitLocale", () => {
	it("reads the language and the plain path from an address", () => {
		expect(splitLocale("/")).toEqual({ locale: "en", path: "/" });
		expect(splitLocale("/projects")).toEqual({
			locale: "en",
			path: "/projects",
		});
		expect(splitLocale("/id")).toEqual({ locale: "id", path: "/" });
		expect(splitLocale("/id/")).toEqual({ locale: "id", path: "/" });
		expect(splitLocale("/id/projects/x")).toEqual({
			locale: "id",
			path: "/projects/x",
		});
	});

	it("does not mistake a path that merely starts with the letters id", () => {
		expect(splitLocale("/idea")).toEqual({ locale: "en", path: "/idea" });
		expect(splitLocale("/identity/x")).toEqual({
			locale: "en",
			path: "/identity/x",
		});
	});
});

describe("alternates", () => {
	it("gives the same page in every language", () => {
		expect(alternates("/projects")).toEqual({
			en: "/projects",
			id: "/id/projects",
		});
		expect(alternates("/")).toEqual({ en: "/", id: "/id" });
	});
});

describe("switchPath", () => {
	it("goes to the same page in the other language", () => {
		expect(switchPath("/projects/ketik-mancing", "id")).toBe(
			"/id/projects/ketik-mancing"
		);
		expect(switchPath("/id/projects/ketik-mancing", "en")).toBe(
			"/projects/ketik-mancing"
		);
		expect(switchPath("/", "id")).toBe("/id");
		expect(switchPath("/id", "en")).toBe("/");
	});

	it("has nowhere to go from the design system, which is English only", () => {
		expect(switchPath("/design-system", "id")).toBeUndefined();
	});
});

describe("translate", () => {
	it("looks up a key in the language", () => {
		expect(translate("en", "nav.projects")).toBe("Projects");
		expect(translate("id", "nav.projects")).toBe("Proyek");
	});

	it("fills {placeholders}", () => {
		expect(translate("en", "contact.mailSubject", { name: "Alex" })).toBe(
			"Message from Alex"
		);
		expect(translate("id", "contact.mailSubject", { name: "Alex" })).toBe(
			"Pesan dari Alex"
		);
	});

	it("builds the tagline and its headline lines from the dictionary", () => {
		expect(headlineLines("en")).toEqual([
			"We make games",
			"from our table.",
			"To your table.",
		]);
		expect(tagline("en")).toBe("We make games from our table. To your table.");
		expect(headlineLines("id")).toHaveLength(3);
		expect(tagline("id")).toBe(headlineLines("id").join(" "));
	});
});

describe("dictionaries", () => {
	const enKeys = Object.keys(en).sort();
	const idKeys = Object.keys(id).sort();

	it("have the same keys in both languages", () => {
		expect(idKeys).toEqual(enKeys);
	});

	it("have no empty text", () => {
		for (const [key, value] of [...Object.entries(en), ...Object.entries(id)]) {
			expect(value.trim(), key).not.toBe("");
		}
	});

	it("use the same {placeholders} in both languages", () => {
		const placeholders = (text: string) =>
			(text.match(/\{\w+\}/g) ?? []).sort();
		for (const key of enKeys) {
			expect(placeholders(id[key as keyof typeof id]), key).toEqual(
				placeholders(en[key as keyof typeof en])
			);
		}
	});

	it("really translate: most Indonesian texts differ from the English", () => {
		const same = enKeys.filter(
			(key) => en[key as keyof typeof en] === id[key as keyof typeof id]
		);
		expect(same.length / enKeys.length).toBeLessThan(0.3);
	});
});
