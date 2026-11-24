import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./Accordion";

const items = [
	{ id: "one", question: "First question?", answer: "First answer." },
	{ id: "two", question: "Second question?", answer: "Second answer." },
	{ id: "three", question: "Third question?", answer: "Third answer." },
];

describe("Accordion", () => {
	it("starts collapsed unless defaultOpenId is given", () => {
		const { unmount } = render(<Accordion items={items} />);
		expect(
			screen.getByRole("button", { name: /first question/i })
		).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByText("First answer.")).not.toBeVisible();
		unmount();

		render(<Accordion items={items} defaultOpenId="two" />);
		expect(
			screen.getByRole("button", { name: /second question/i })
		).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Second answer.")).toBeVisible();
	});

	it("opens one panel at a time by default and closes the previous one", async () => {
		render(<Accordion items={items} />);
		const first = screen.getByRole("button", { name: /first question/i });
		const second = screen.getByRole("button", { name: /second question/i });

		await userEvent.click(first);
		expect(first).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("First answer.")).toBeVisible();

		await userEvent.click(second);
		expect(first).toHaveAttribute("aria-expanded", "false");
		expect(second).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Second answer.")).toBeVisible();
	});

	it("allows multiple panels open when allowMultiple is true", async () => {
		render(<Accordion items={items} allowMultiple />);
		const first = screen.getByRole("button", { name: /first question/i });
		const second = screen.getByRole("button", { name: /second question/i });
		await userEvent.click(first);
		await userEvent.click(second);
		expect(first).toHaveAttribute("aria-expanded", "true");
		expect(second).toHaveAttribute("aria-expanded", "true");
	});

	it("moves focus across headers with ArrowDown, ArrowUp, Home and End", async () => {
		render(<Accordion items={items} />);
		const first = screen.getByRole("button", { name: /first question/i });
		const second = screen.getByRole("button", { name: /second question/i });
		const third = screen.getByRole("button", { name: /third question/i });

		first.focus();
		await userEvent.keyboard("{ArrowDown}");
		expect(second).toHaveFocus();
		await userEvent.keyboard("{End}");
		expect(third).toHaveFocus();
		await userEvent.keyboard("{ArrowDown}");
		expect(first).toHaveFocus();
		await userEvent.keyboard("{ArrowUp}");
		expect(third).toHaveFocus();
		await userEvent.keyboard("{Home}");
		expect(first).toHaveFocus();
	});

	it("links each panel region to its controlling trigger button", async () => {
		render(<Accordion items={items} defaultOpenId="one" />);
		const trigger = screen.getByRole("button", { name: /first question/i });
		const region = screen.getByRole("region", { name: /first question/i });
		expect(trigger).toHaveAttribute("aria-controls", region.id);
	});
});
