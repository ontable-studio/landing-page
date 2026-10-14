import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Lightbox } from "./Lightbox";

const items = [
	{ src: "/a.webp", alt: "First picture" },
	{ src: "/b.webp", alt: "Second picture" },
	{ src: "/c.webp", alt: "Third picture" },
];

function setup(index: number | null = 1, list = items) {
	const onIndexChange = vi.fn();
	const onClose = vi.fn();
	const view = render(
		<Lightbox
			items={list}
			index={index}
			onIndexChange={onIndexChange}
			onClose={onClose}
		/>
	);
	return { onIndexChange, onClose, ...view };
}

afterEach(() => {
	document.body.style.overflow = "";
	document.body.style.paddingRight = "";
});

describe("Lightbox", () => {
	it("renders nothing while closed", () => {
		setup(null);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("is a modal dialog showing the current picture, its caption and a counter", () => {
		setup(1);
		const dialog = screen.getByRole("dialog", { name: "Image preview" });
		expect(dialog).toHaveAttribute("aria-modal", "true");
		const img = screen.getByRole("img", { name: "Second picture" });
		expect(img).toHaveAttribute("src", "/b.webp");
		expect(screen.getByText("2 / 3")).toBeInTheDocument();
		expect(screen.getAllByText("Second picture").length).toBeGreaterThan(0);
	});

	it("closes on Escape", async () => {
		const { onClose } = setup();
		await userEvent.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("moves with the arrow keys, wrapping at the ends", async () => {
		const first = setup(0);
		await userEvent.keyboard("{ArrowLeft}");
		expect(first.onIndexChange).toHaveBeenLastCalledWith(2);
		first.unmount();
		const last = setup(2);
		await userEvent.keyboard("{ArrowRight}");
		expect(last.onIndexChange).toHaveBeenLastCalledWith(0);
	});

	it("has Previous and Next buttons that move one picture", async () => {
		const { onIndexChange } = setup(1);
		await userEvent.click(screen.getByRole("button", { name: "Next image" }));
		expect(onIndexChange).toHaveBeenLastCalledWith(2);
		await userEvent.click(
			screen.getByRole("button", { name: "Previous image" })
		);
		expect(onIndexChange).toHaveBeenLastCalledWith(0);
	});

	it("drops the arrows and the counter when there is only one picture", () => {
		setup(0, [items[0]]);
		expect(
			screen.queryByRole("button", { name: "Next image" })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Previous image" })
		).not.toBeInTheDocument();
		expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
	});

	it("closes on a click on the backdrop but not on the picture", async () => {
		const { onClose } = setup();
		await userEvent.click(screen.getByRole("img", { name: "Second picture" }));
		expect(onClose).not.toHaveBeenCalled();
		await userEvent.click(screen.getByRole("dialog"));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closes with the Close button", async () => {
		const { onClose } = setup();
		await userEvent.click(
			screen.getByRole("button", { name: "Close preview" })
		);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("focuses Close on open and hands focus back to the opener on close", () => {
		const opener = document.createElement("button");
		document.body.append(opener);
		opener.focus();
		const { rerender } = render(
			<Lightbox
				items={items}
				index={1}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
			/>
		);
		expect(screen.getByRole("button", { name: "Close preview" })).toHaveFocus();
		rerender(
			<Lightbox
				items={items}
				index={null}
				onIndexChange={vi.fn()}
				onClose={vi.fn()}
			/>
		);
		expect(opener).toHaveFocus();
		opener.remove();
	});

	it("keeps Tab inside the dialog", async () => {
		setup(1);
		const close = screen.getByRole("button", { name: "Close preview" });
		const next = screen.getByRole("button", { name: "Next image" });
		next.focus();
		await userEvent.tab();
		expect(close).toHaveFocus();
		await userEvent.tab({ shift: true });
		expect(next).toHaveFocus();
	});

	it("stops the page behind from scrolling while open, and restores it after", () => {
		const { unmount } = setup();
		expect(document.body.style.overflow).toBe("hidden");
		unmount();
		expect(document.body.style.overflow).toBe("");
	});

	it("uses a plain dark backdrop, with no blur", () => {
		const { baseElement } = setup();
		const backdrop = baseElement.querySelector(
			"[data-backdrop]"
		) as HTMLElement;
		expect(backdrop.className).toMatch(/bg-black/);
		expect(screen.getByRole("dialog").className).not.toMatch(/blur/);
		expect(backdrop.className).not.toMatch(/blur/);
	});
});
