import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn()", () => {
	it("merges single class", () => {
		expect(cn("text-red-500")).toBe("text-red-500");
	});

	it("merges multiple classes", () => {
		expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
	});

	it("resolves Tailwind conflicts (later wins)", () => {
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
	});

	it("handles falsy values", () => {
		expect(cn("text-red-500", false, undefined, null)).toBe("text-red-500");
	});

	it("handles conditional classes", () => {
		const isActive = true;
		expect(cn("base", isActive && "active")).toBe("base active");
	});

	it("handles empty input", () => {
		expect(cn()).toBe("");
	});
});

describe("cn with the theme's custom text tokens", () => {
	it("keeps a text colour next to a custom font-size token", () => {
		expect(cn("text-text-primary", "text-h2")).toBe(
			"text-text-primary text-h2"
		);
	});

	it("lets a custom font-size token replace a default one", () => {
		expect(cn("text-base", "text-body")).toBe("text-body");
	});
});
