import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
	it("renders its children as a mono uppercase pill", () => {
		render(<Badge>PC</Badge>);
		expect(screen.getByText("PC")).toHaveClass(
			"font-mono",
			"uppercase",
			"rounded-full"
		);
	});

	it("brand variant uses the brand colour", () => {
		render(<Badge variant="brand">x</Badge>);
		expect(screen.getByText("x")).toHaveClass("bg-brand");
	});

	it("outline variant has a border", () => {
		render(<Badge variant="outline">x</Badge>);
		expect(screen.getByText("x")).toHaveClass("border");
	});

	it("merges a className last", () => {
		render(<Badge className="ml-2">x</Badge>);
		expect(screen.getByText("x")).toHaveClass("ml-2");
	});
});
