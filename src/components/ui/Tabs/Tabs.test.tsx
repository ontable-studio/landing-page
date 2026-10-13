import { describe, it, expect, vi } from "vitest";
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

	it("gives the active tab a solid style and the others an outline", () => {
		render(<Controlled initial="game" />);
		expect(screen.getByRole("tab", { name: "Game" }).className).toMatch(
			/bg-text-primary/
		);
		expect(screen.getByRole("tab", { name: "All" }).className).toMatch(
			/border/
		);
	});
});
