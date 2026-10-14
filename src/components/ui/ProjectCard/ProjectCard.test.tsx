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

	it("renders through linkAs when given", () => {
		function Probe({
			href,
			className,
			children,
		}: {
			href: string;
			className?: string;
			children: React.ReactNode;
		}) {
			return (
				<a data-probe="" href={href} className={className}>
					{children}
				</a>
			);
		}
		const { container } = render(
			<ProjectCard {...base} href="/x" linkAs={Probe} />
		);
		expect(container.querySelector("[data-probe]")).toHaveAttribute(
			"href",
			"/x"
		);
	});

	it("renders a plain anchor without linkAs", () => {
		const { container } = render(<ProjectCard {...base} href="/x" />);
		expect(container.querySelector("[data-probe]")).toBeNull();
		expect(screen.getByRole("link")).toHaveAttribute("href", "/x");
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

	it("lifts and gains a shadow on hover and focus", () => {
		render(<ProjectCard {...base} href="/x" />);
		const cls = screen.getByRole("link").className;
		expect(cls).toContain("hover:-translate-y-1");
		expect(cls).toContain("focus-visible:-translate-y-1");
		expect(cls).toMatch(/hover:shadow-/);
	});

	it("shows a View chip that follows the pointer, only on linked cards", () => {
		const { container, rerender } = render(<ProjectCard {...base} href="/x" />);
		const chip = container.querySelector("[data-chip]") as HTMLElement;
		expect(chip).toHaveAttribute("aria-hidden", "true");
		expect(chip).toHaveTextContent("View");
		expect(chip.getAttribute("style")).toMatch(/var\(--gx/);
		expect(chip.getAttribute("style")).toMatch(
			/opacity:\s*var\(--glow-on,\s*0\)/
		);
		rerender(<ProjectCard {...base} />);
		expect(container.querySelector("[data-chip]")).toBeNull();
	});

	it("shows no year tab when the project has no year yet", () => {
		const { container, rerender } = render(<ProjectCard {...base} />);
		expect(container.querySelector("[data-year]")).toBeInTheDocument();
		rerender(<ProjectCard title="Domo" category="Puzzle" />);
		expect(container.querySelector("[data-year]")).toBeNull();
		expect(screen.getByRole("heading", { name: "Domo" })).toBeInTheDocument();
	});

	it("clamps a very long title", () => {
		const title = "A".repeat(120);
		render(<ProjectCard {...base} title={title} />);
		expect(screen.getByRole("heading", { name: title })).toHaveClass(
			"line-clamp-2"
		);
	});
});
