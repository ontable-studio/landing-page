import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
	it("renders its children with rounded corners", () => {
		render(<Card>body</Card>);
		expect(screen.getByText("body")).toHaveClass("rounded-2xl");
	});

	it("bordered has a border", () => {
		render(<Card variant="bordered">x</Card>);
		expect(screen.getByText("x")).toHaveClass("border");
	});

	it("elevated has a shadow", () => {
		render(<Card variant="elevated">x</Card>);
		expect(screen.getByText("x").className).toMatch(/shadow/);
	});

	it("merges a className last", () => {
		render(<Card className="p-8">x</Card>);
		expect(screen.getByText("x")).toHaveClass("p-8");
	});
});
