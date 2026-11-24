import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./Reveal";

describe("Reveal", () => {
	it("renders its children cleanly", () => {
		render(
			<Reveal delay={0.1}>
				<p>Studio craft</p>
			</Reveal>
		);
		expect(screen.getByText("Studio craft")).toBeInTheDocument();
	});
});
