import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

afterEach(() => {
	document.body.style.overflow = "";
	document.body.style.paddingRight = "";
});

function setup(onClose = vi.fn()) {
	const view = render(
		<Modal label="Example dialog" onClose={onClose}>
			<button type="button">First</button>
			<input aria-label="Name" />
			<textarea aria-label="Message" />
			<a href="/somewhere">Last link</a>
		</Modal>
	);
	return { onClose, ...view };
}

describe("Modal", () => {
	it("is a labelled modal dialog holding its children, outside the page's own tree", () => {
		const { container } = setup();
		const dialog = screen.getByRole("dialog", { name: "Example dialog" });
		expect(dialog).toHaveAttribute("aria-modal", "true");
		expect(screen.getByRole("button", { name: "First" })).toBeInTheDocument();
		expect(container.querySelector('[role="dialog"]')).toBeNull();
		expect(document.body.contains(dialog)).toBe(true);
	});

	it("closes on Escape", async () => {
		const { onClose } = setup();
		await userEvent.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closes on a click on the backdrop or the empty area, not on the content", async () => {
		const { onClose, baseElement } = setup();
		await userEvent.click(screen.getByRole("button", { name: "First" }));
		expect(onClose).not.toHaveBeenCalled();
		await userEvent.click(
			baseElement.querySelector("[data-backdrop]") as HTMLElement
		);
		expect(onClose).toHaveBeenCalledTimes(1);
		await userEvent.click(screen.getByRole("dialog"));
		expect(onClose).toHaveBeenCalledTimes(2);
	});

	it("uses a plain dark backdrop, with no blur", () => {
		const { baseElement } = setup();
		const backdrop = baseElement.querySelector(
			"[data-backdrop]"
		) as HTMLElement;
		expect(backdrop).toHaveAttribute("aria-hidden", "true");
		expect(backdrop.className).toMatch(/bg-black/);
		expect(backdrop.className).not.toMatch(/blur/);
		expect(screen.getByRole("dialog").className).not.toMatch(/blur/);
	});

	it("focuses the first focusable element on open", () => {
		setup();
		expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
	});

	it("focuses the element marked data-autofocus instead, when there is one", () => {
		render(
			<Modal label="With a field" onClose={vi.fn()}>
				<button type="button">Close</button>
				<input aria-label="Name" data-autofocus="" />
			</Modal>
		);
		expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
	});

	it("hands focus back to whatever opened it when it goes away", () => {
		const opener = document.createElement("button");
		document.body.append(opener);
		opener.focus();
		const { unmount } = setup();
		expect(opener).not.toHaveFocus();
		unmount();
		expect(opener).toHaveFocus();
		opener.remove();
	});

	it("keeps Tab inside, across buttons, fields and links", async () => {
		setup();
		const first = screen.getByRole("button", { name: "First" });
		const last = screen.getByRole("link", { name: "Last link" });
		last.focus();
		await userEvent.tab();
		expect(first).toHaveFocus();
		await userEvent.tab({ shift: true });
		expect(last).toHaveFocus();
	});

	it("stops the page behind from scrolling while open, and restores it after", () => {
		const { unmount } = setup();
		expect(document.body.style.overflow).toBe("hidden");
		unmount();
		expect(document.body.style.overflow).toBe("");
	});
});
