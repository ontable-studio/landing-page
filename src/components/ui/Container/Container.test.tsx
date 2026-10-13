import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "./Container";

describe("Container", () => {
	it("renders its children", () => {
		render(<Container>hello</Container>);
		expect(screen.getByText("hello")).toBeInTheDocument();
	});

	it("is centred with a wide max width by default", () => {
		render(<Container>x</Container>);
		const el = screen.getByText("x");
		expect(el).toHaveClass("mx-auto", "max-w-6xl");
	});

	it("narrows with size=narrow", () => {
		render(<Container size="narrow">x</Container>);
		expect(screen.getByText("x")).toHaveClass("max-w-3xl");
	});

	it("merges a className last", () => {
		render(<Container className="py-4">x</Container>);
		expect(screen.getByText("x")).toHaveClass("py-4");
	});
});
