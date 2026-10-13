import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
	it("renders the title as an h2 by default", () => {
		render(<SectionHeader title="Projects" />);
		expect(
			screen.getByRole("heading", { level: 2, name: "Projects" })
		).toBeInTheDocument();
	});

	it("renders an h1 with as=h1", () => {
		render(<SectionHeader title="Hello" as="h1" />);
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
	});

	it("shows eyebrow and description only when given", () => {
		const { rerender } = render(<SectionHeader title="T" />);
		expect(screen.queryByText("Eyebrow")).not.toBeInTheDocument();
		rerender(<SectionHeader title="T" eyebrow="Eyebrow" description="Desc" />);
		expect(screen.getByText("Eyebrow")).toBeInTheDocument();
		expect(screen.getByText("Desc")).toBeInTheDocument();
	});
});
