import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { RouteTransition, channelLabelFor } from "./RouteTransition";

describe("RouteTransition", () => {
	it("formats clean OnTable labels for every route and locale without CH prefixes", () => {
		expect(channelLabelFor("/")).toBe("OnTable - Home");
		expect(channelLabelFor("/id")).toBe("OnTable - Home");
		expect(channelLabelFor("/projects")).toBe("OnTable - Projects");
		expect(channelLabelFor("/id/projects")).toBe("OnTable - Projects");
		expect(channelLabelFor("/projects/craftboard-heroes")).toBe(
			"OnTable - Craftboard Heroes"
		);
		expect(channelLabelFor("/projects/oxshiftgen")).toBe(
			"OnTable - OxShiftGen"
		);
		expect(channelLabelFor("/design-system")).toBe("OnTable - Design System");
	});

	it("renders the top scroll progress rail and keeps the curtain idle on initial paint", () => {
		const { container } = render(
			<MemoryRouter initialEntries={["/"]}>
				<RouteTransition />
			</MemoryRouter>
		);
		expect(
			container.querySelector("[data-scroll-progress]")
		).toBeInTheDocument();
		expect(container.querySelector("[data-route-curtain]")).toBeNull();
	});
});
