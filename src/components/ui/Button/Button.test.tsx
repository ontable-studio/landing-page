import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
	it("renders a button without href", () => {
		render(<Button>Go</Button>);
		expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
	});

	it("renders a link, and never a button, with href", () => {
		render(<Button href="/projects">Projects</Button>);
		expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
			"href",
			"/projects"
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("primary uses the brand colour", () => {
		render(<Button>x</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-brand");
	});

	it("md and lg labels are semibold for contrast on orange", () => {
		render(
			<>
				<Button size="md">md</Button>
				<Button size="lg">lg</Button>
			</>
		);
		expect(screen.getByText("md")).toHaveClass("font-semibold");
		expect(screen.getByText("lg")).toHaveClass("font-semibold");
	});

	it("arrow renders a decorative svg", () => {
		const { container } = render(<Button arrow>x</Button>);
		expect(container.querySelector("svg")).toHaveAttribute(
			"aria-hidden",
			"true"
		);
	});

	it("fires onClick", async () => {
		const onClick = vi.fn();
		render(<Button onClick={onClick}>x</Button>);
		await userEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
