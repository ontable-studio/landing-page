import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { DotGrid } from "./DotGrid";

describe("DotGrid", () => {
	it("is a decorative, click-through layer behind the content", () => {
		const { container } = render(<DotGrid />);
		const root = container.querySelector("[data-dot-grid]");
		expect(root).toHaveAttribute("aria-hidden", "true");
		expect(root?.className).toMatch(/pointer-events-none/);
		expect(root?.className).toMatch(/absolute/);
	});

	it("draws a plain dot pattern when not interactive", () => {
		const { container } = render(<DotGrid />);
		expect(container.querySelector("[data-glow]")).toBeNull();
		expect(container.innerHTML).toMatch(/radial-gradient/);
	});

	it("adds an orange glow layer that follows the --gx and --gy variables", () => {
		const { container } = render(<DotGrid interactive />);
		const glow = container.querySelector("[data-glow]") as HTMLElement;
		expect(glow).toBeInTheDocument();
		expect(glow.getAttribute("style")).toMatch(/var\(--gx/);
		expect(glow.getAttribute("style")).toMatch(/var\(--gy/);
	});

	it("keeps the glow hidden until the pointer has moved", () => {
		const { container } = render(<DotGrid interactive />);
		const glow = container.querySelector("[data-glow]") as HTMLElement;
		expect(glow.getAttribute("style")).toMatch(
			/opacity:\s*var\(--glow-on,\s*0\)/
		);
	});

	it("passes a className to the layer", () => {
		const { container } = render(<DotGrid className="opacity-40" />);
		expect(container.querySelector("[data-dot-grid]")?.className).toMatch(
			/opacity-40/
		);
	});
});
