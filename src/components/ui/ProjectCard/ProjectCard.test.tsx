import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";

const base = { title: "Domo", category: "Puzzle", year: 2026 };

describe("ProjectCard", () => {
	it("renders the title as a heading, with category and year", () => {
		render(<ProjectCard {...base} />);
		expect(screen.getByRole("heading", { name: "Domo" })).toBeInTheDocument();
		expect(screen.getByText("Puzzle")).toBeInTheDocument();
		expect(screen.getByText("2026")).toBeInTheDocument();
	});

	it("is a link to href when given one", () => {
		render(<ProjectCard {...base} href="/projects/domo" />);
		expect(screen.getByRole("link")).toHaveAttribute("href", "/projects/domo");
	});

	it("has no link without href", () => {
		render(<ProjectCard {...base} />);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("shows the image with the title as default alt", () => {
		render(<ProjectCard {...base} image="/a.webp" />);
		expect(screen.getByRole("img", { name: "Domo" })).toHaveAttribute(
			"src",
			"/a.webp"
		);
	});

	it("uses imageAlt when given", () => {
		render(<ProjectCard {...base} image="/a.webp" imageAlt="Key art" />);
		expect(screen.getByRole("img", { name: "Key art" })).toBeInTheDocument();
	});

	it("renders a hidden placeholder without an image", () => {
		const { container } = render(<ProjectCard {...base} />);
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
		expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});

	it("cuts the corner of the picture frame", () => {
		const { container } = render(<ProjectCard {...base} />);
		expect(container.querySelector(".cut-corner")).toBeInTheDocument();
	});

	it("draws the year in the cut corner, outside the clipped picture", () => {
		const { container } = render(<ProjectCard {...base} />);
		const clipped = container.querySelector(".cut-corner");
		const year = screen.getByText("2026");
		expect(clipped).not.toContainElement(year);
		expect(year).toHaveClass("right-5");
	});

	it("clamps a very long title", () => {
		const title = "A".repeat(120);
		render(<ProjectCard {...base} title={title} />);
		expect(screen.getByRole("heading", { name: title })).toHaveClass(
			"line-clamp-2"
		);
	});
});
