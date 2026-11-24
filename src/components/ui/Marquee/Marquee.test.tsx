import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Marquee } from "./Marquee";

describe("Marquee", () => {
	it("renders all items once for assistive tech and duplicates visually for seamless loop", () => {
		const { container } = render(
			<Marquee
				items={[
					{ label: "Craftboard Heroes", meta: "Action" },
					{ label: "Ketik Mancing", meta: "Typing" },
				]}
			/>
		);
		expect(container.querySelector("[data-marquee]")).toBeInTheDocument();
		expect(screen.getAllByText("Craftboard Heroes")).toHaveLength(2);
		expect(
			container.querySelectorAll('[aria-hidden="true"]').length
		).toBeGreaterThanOrEqual(1);
	});
});
