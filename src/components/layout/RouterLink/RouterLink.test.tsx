import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { RouterLink } from "./RouterLink";

function Where() {
	return <p data-testid="where">{useLocation().pathname}</p>;
}

describe("RouterLink", () => {
	it("renders a link to href", () => {
		render(
			<MemoryRouter>
				<RouterLink href="/projects">Projects</RouterLink>
			</MemoryRouter>
		);
		expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
			"href",
			"/projects"
		);
	});

	it("navigates inside the router on click", async () => {
		render(
			<MemoryRouter>
				<RouterLink href="/projects">Projects</RouterLink>
				<Where />
			</MemoryRouter>
		);
		await userEvent.click(screen.getByRole("link", { name: "Projects" }));
		expect(screen.getByTestId("where")).toHaveTextContent("/projects");
	});
});
