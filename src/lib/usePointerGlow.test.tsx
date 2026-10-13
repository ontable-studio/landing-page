import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { usePointerGlow } from "./usePointerGlow";

let queue: FrameRequestCallback[] = [];

function flushFrames(count = 120) {
	for (let i = 0; i < count && queue.length > 0; i++) {
		const batch = queue;
		queue = [];
		for (const cb of batch) cb(0);
	}
}

function stubMedia(matches: Record<string, boolean>) {
	vi.stubGlobal(
		"matchMedia",
		(query: string) => ({ matches: matches[query] ?? false }) as MediaQueryList
	);
}

function Probe() {
	const ref = useRef<HTMLDivElement>(null);
	usePointerGlow(ref);
	return <div ref={ref} data-testid="area" />;
}

function move(el: HTMLElement, x: number, y: number) {
	fireEvent(
		el,
		new MouseEvent("pointermove", { clientX: x, clientY: y, bubbles: true })
	);
}

beforeEach(() => {
	queue = [];
	vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
		queue.push(cb);
		return queue.length;
	});
	vi.stubGlobal("cancelAnimationFrame", () => {
		queue = [];
	});
});

afterEach(() => vi.unstubAllGlobals());

describe("usePointerGlow", () => {
	it("eases the --gx and --gy variables to the pointer position", () => {
		stubMedia({ "(hover: hover) and (pointer: fine)": true });
		render(<Probe />);
		const area = screen.getByTestId("area");
		move(area, 300, 120);
		flushFrames();
		expect(area.style.getPropertyValue("--gx")).toBe("300px");
		expect(area.style.getPropertyValue("--gy")).toBe("120px");
	});

	it("reports the pointer as -1 to 1 across the box", () => {
		stubMedia({ "(hover: hover) and (pointer: fine)": true });
		render(<Probe />);
		const area = screen.getByTestId("area");
		area.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 1000, height: 500 }) as DOMRect;
		move(area, 1000, 0);
		flushFrames();
		expect(area.style.getPropertyValue("--nx")).toBe("1");
		expect(area.style.getPropertyValue("--ny")).toBe("-1");
	});

	it("switches the glow on while the pointer is over and off when it leaves", () => {
		stubMedia({ "(hover: hover) and (pointer: fine)": true });
		render(<Probe />);
		const area = screen.getByTestId("area");
		move(area, 10, 10);
		expect(area.style.getPropertyValue("--glow-on")).toBe("1");
		fireEvent(area, new MouseEvent("pointerleave"));
		expect(area.style.getPropertyValue("--glow-on")).toBe("0");
	});

	it("does nothing on devices without a hovering fine pointer", () => {
		stubMedia({});
		render(<Probe />);
		const area = screen.getByTestId("area");
		move(area, 300, 120);
		flushFrames();
		expect(area.style.getPropertyValue("--gx")).toBe("");
		expect(area.style.getPropertyValue("--glow-on")).toBe("");
	});

	it("does nothing when the visitor prefers reduced motion", () => {
		stubMedia({
			"(hover: hover) and (pointer: fine)": true,
			"(prefers-reduced-motion: reduce)": true,
		});
		render(<Probe />);
		const area = screen.getByTestId("area");
		move(area, 300, 120);
		flushFrames();
		expect(area.style.getPropertyValue("--gx")).toBe("");
	});

	it("stops scheduling frames once it has settled", () => {
		stubMedia({ "(hover: hover) and (pointer: fine)": true });
		render(<Probe />);
		const area = screen.getByTestId("area");
		move(area, 50, 50);
		move(area, 400, 300);
		flushFrames();
		expect(queue).toHaveLength(0);
	});
});
