import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const items = [
	{ id: "all", label: "All" },
	{ id: "game", label: "Game" },
	{ id: "ui", label: "UI Design" },
];

function Controlled({ initial = "all" }: { initial?: string }) {
	const [value, setValue] = useState(initial);
	return (
		<Tabs
			items={items}
			value={value}
			onValueChange={setValue}
			ariaLabel="Project types"
			panelId="panel"
		/>
	);
}

describe("Tabs", () => {
	it("renders a labelled tablist with one tab per item", () => {
		render(<Controlled />);
		expect(
			screen.getByRole("tablist", { name: "Project types" })
		).toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(3);
	});

	it("marks only the selected tab, and only it is in the tab order", () => {
		render(<Controlled initial="game" />);
		expect(screen.getByRole("tab", { name: "Game" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
			"aria-selected",
			"false"
		);
		expect(screen.getByRole("tab", { name: "Game" })).toHaveAttribute(
			"tabindex",
			"0"
		);
		expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
			"tabindex",
			"-1"
		);
	});

	it("points every tab at the panel", () => {
		render(<Controlled />);
		for (const tab of screen.getAllByRole("tab")) {
			expect(tab).toHaveAttribute("aria-controls", "panel");
		}
	});

	it("calls onValueChange with the item id on click", async () => {
		const onValueChange = vi.fn();
		render(
			<Tabs
				items={items}
				value="all"
				onValueChange={onValueChange}
				ariaLabel="Project types"
				panelId="panel"
			/>
		);
		await userEvent.click(screen.getByRole("tab", { name: "UI Design" }));
		expect(onValueChange).toHaveBeenCalledWith("ui");
	});

	it("moves with the arrow keys, wrapping at the ends, and moves focus", async () => {
		render(<Controlled />);
		screen.getByRole("tab", { name: "All" }).focus();
		await userEvent.keyboard("{ArrowRight}");
		expect(screen.getByRole("tab", { name: "Game" })).toHaveFocus();
		expect(screen.getByRole("tab", { name: "Game" })).toHaveAttribute(
			"aria-selected",
			"true"
		);
		await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
		expect(screen.getByRole("tab", { name: "UI Design" })).toHaveFocus();
	});

	it("jumps to the first and last tab with Home and End", async () => {
		render(<Controlled initial="game" />);
		screen.getByRole("tab", { name: "Game" }).focus();
		await userEvent.keyboard("{End}");
		expect(screen.getByRole("tab", { name: "UI Design" })).toHaveFocus();
		await userEvent.keyboard("{Home}");
		expect(screen.getByRole("tab", { name: "All" })).toHaveFocus();
	});

	it("gives the active tab white text and the others an outline", () => {
		render(<Controlled initial="game" />);
		expect(screen.getByRole("tab", { name: "Game" }).className).toMatch(
			/text-white/
		);
		expect(screen.getByRole("tab", { name: "All" }).className).toMatch(
			/border/
		);
	});
});

describe("Tabs sliding indicator", () => {
	const offsets: Record<string, [number, number]> = {
		All: [0, 50],
		Game: [58, 70],
		"UI Design": [136, 110],
	};

	beforeEach(() => {
		Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
			configurable: true,
			get() {
				return offsets[(this as HTMLElement).textContent ?? ""]?.[0] ?? 0;
			},
		});
		Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
			configurable: true,
			get() {
				return offsets[(this as HTMLElement).textContent ?? ""]?.[1] ?? 0;
			},
		});
	});

	afterEach(() => {
		Reflect.deleteProperty(HTMLElement.prototype, "offsetLeft");
		Reflect.deleteProperty(HTMLElement.prototype, "offsetWidth");
	});

	it("sits behind the selected tab as a solid pill", () => {
		render(<Controlled initial="game" />);
		const indicator = document.querySelector("[data-indicator]") as HTMLElement;
		expect(indicator).toHaveAttribute("aria-hidden", "true");
		expect(indicator.className).toMatch(/bg-text-primary/);
		expect(indicator.getAttribute("style")).toMatch(/width:\s*70px/);
		expect(indicator.getAttribute("style")).toMatch(
			/transform:\s*translateX\(58px\)/
		);
	});

	it("slides to the next tab when the selection changes", async () => {
		render(<Controlled />);
		await userEvent.click(screen.getByRole("tab", { name: "UI Design" }));
		const indicator = document.querySelector("[data-indicator]") as HTMLElement;
		expect(indicator.getAttribute("style")).toMatch(/width:\s*110px/);
		expect(indicator.getAttribute("style")).toMatch(
			/transform:\s*translateX\(136px\)/
		);
		expect(indicator.className).toMatch(/transition-/);
	});
});
