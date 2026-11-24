import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CrtScreen } from "./CrtScreen";

describe("CrtScreen", () => {
	it("renders the base image cleanly in idle and fractures into 6 bands during glitch", () => {
		const { container, rerender } = render(
			<CrtScreen src="/demo.webp" alt="Gameplay frame" glitchLevel="idle" />
		);
		expect(screen.getByRole("img", { name: "Gameplay frame" })).toHaveAttribute(
			"src",
			"/demo.webp"
		);
		expect(container.querySelector("[data-crt-screen]")).toHaveAttribute(
			"data-glitch",
			"idle"
		);
		expect(container.querySelectorAll("[data-crt-band]")).toHaveLength(0);

		rerender(
			<CrtScreen src="/demo.webp" alt="Gameplay frame" glitchLevel="burst" />
		);
		expect(container.querySelector("[data-crt-screen]")).toHaveAttribute(
			"data-glitch",
			"burst"
		);
		expect(container.querySelectorAll("[data-crt-band]")).toHaveLength(6);
		expect(container.querySelector("[data-crt-blackout]")).toBeInTheDocument();
	});
});
