import { describe, expect, it } from "vitest";
import { underlineLink } from "./linkStyles";

describe("underlineLink", () => {
	it("draws an underline from the left on hover and on keyboard focus", () => {
		for (const part of [
			"after:origin-left",
			"after:scale-x-0",
			"hover:after:scale-x-100",
			"focus-visible:after:scale-x-100",
		]) {
			expect(underlineLink).toContain(part);
		}
	});
});
