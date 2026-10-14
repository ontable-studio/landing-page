import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SITE } from "../../../common/constants";
import { ContactDialog } from "./ContactDialog";
import { ContactProvider, useContact } from "./ContactProvider";

afterEach(() => {
	vi.unstubAllGlobals();
});

function setup() {
	const onClose = vi.fn();
	const onSend = vi.fn();
	const view = render(<ContactDialog onClose={onClose} onSend={onSend} />);
	return { onClose, onSend, ...view };
}

const fill = async (name: string, email: string, message: string) => {
	if (name) await userEvent.type(screen.getByLabelText("Name"), name);
	if (email) await userEvent.type(screen.getByLabelText("Email"), email);
	if (message) await userEvent.type(screen.getByLabelText("Message"), message);
};

describe("ContactDialog", () => {
	it("is a dialog titled for the visitor's project, with name, email and message fields", () => {
		setup();
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
		expect(
			screen.getByRole("heading", {
				level: 2,
				name: "Tell us about your project",
			})
		).toBeInTheDocument();
		for (const label of ["Name", "Email", "Message"]) {
			expect(screen.getByLabelText(label)).toBeInTheDocument();
		}
		expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
		expect(screen.getByLabelText("Message").tagName).toBe("TEXTAREA");
	});

	it("starts with the cursor in the Name field", () => {
		setup();
		expect(screen.getByLabelText("Name")).toHaveFocus();
	});

	it("shows the studio's email as a link, and the social chips", () => {
		setup();
		expect(screen.getByRole("link", { name: SITE.email })).toHaveAttribute(
			"href",
			`mailto:${SITE.email}`
		);
		for (const s of SITE.social) {
			expect(screen.getByRole("link", { name: s.label })).toHaveAttribute(
				"href",
				s.href
			);
		}
	});

	it("copies the email address and says so", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
		setup();
		await userEvent.click(screen.getByRole("button", { name: "Copy email" }));
		expect(writeText).toHaveBeenCalledWith(SITE.email);
		expect(
			await screen.findByRole("button", { name: "Copied" })
		).toBeInTheDocument();
	});

	it("tells the visitor what is missing instead of sending an empty form", async () => {
		const { onSend } = setup();
		await userEvent.click(screen.getByRole("button", { name: "Send" }));
		expect(onSend).not.toHaveBeenCalled();
		expect(screen.getByText("Enter your name")).toBeInTheDocument();
		expect(screen.getByText("Enter your email address")).toBeInTheDocument();
		expect(screen.getByText("Write a message")).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toHaveAttribute(
			"aria-invalid",
			"true"
		);
		expect(screen.getByLabelText("Name")).toHaveFocus();
	});

	it("ties each error to its field", async () => {
		setup();
		await userEvent.click(screen.getByRole("button", { name: "Send" }));
		const field = screen.getByLabelText("Email");
		const error = document.getElementById(
			field.getAttribute("aria-describedby") ?? ""
		);
		expect(error).toHaveTextContent("Enter your email address");
	});

	it("rejects an email that is not one", async () => {
		const { onSend } = setup();
		await fill("Alex", "alex@", "Hello there");
		await userEvent.click(screen.getByRole("button", { name: "Send" }));
		expect(onSend).not.toHaveBeenCalled();
		expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toHaveFocus();
	});

	it("hands a ready-made mailto to onSend, and then says what happens next", async () => {
		const { onSend } = setup();
		await fill("Alex Rivera", "alex@example.test", "Hello there");
		await userEvent.click(screen.getByRole("button", { name: "Send" }));
		expect(onSend).toHaveBeenCalledTimes(1);
		const url = onSend.mock.calls[0][0] as string;
		expect(url.startsWith(`mailto:${SITE.email}?subject=`)).toBe(true);
		expect(decodeURIComponent(url)).toContain("Hello there");
		expect(decodeURIComponent(url)).toContain(
			"Alex Rivera (alex@example.test)"
		);
		const status = screen.getByRole("status");
		expect(status).toHaveTextContent(/email app/i);
		expect(status).toHaveTextContent(SITE.email);
	});

	it("clears an error once the field is fixed", async () => {
		setup();
		await userEvent.click(screen.getByRole("button", { name: "Send" }));
		await userEvent.type(screen.getByLabelText("Name"), "Alex");
		expect(screen.queryByText("Enter your name")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Name")).not.toHaveAttribute(
			"aria-invalid",
			"true"
		);
	});

	it("limits the message so the mail link stays short enough", () => {
		setup();
		expect(screen.getByLabelText("Message")).toHaveAttribute(
			"maxlength",
			"1500"
		);
	});

	it("closes with the close button and with Escape", async () => {
		const { onClose } = setup();
		await userEvent.click(
			screen.getByRole("button", { name: "Close contact" })
		);
		expect(onClose).toHaveBeenCalledTimes(1);
		await userEvent.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalledTimes(2);
	});

	it("puts the chips on the left and Send on the right of the bottom row", () => {
		setup();
		const send = screen.getByRole("button", { name: "Send" });
		const row = send.parentElement as HTMLElement;
		const chips = within(row).getByRole("list");
		expect(row.firstElementChild).toBe(chips);
		expect(row.lastElementChild).toBe(send);
	});
});

describe("ContactProvider", () => {
	function Opener() {
		const { open } = useContact();
		return <button onClick={open}>Open contact</button>;
	}

	it("keeps the dialog closed until something opens it, and closes it again", async () => {
		render(
			<ContactProvider>
				<Opener />
			</ContactProvider>
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		const opener = screen.getByRole("button", { name: "Open contact" });
		await userEvent.click(opener);
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
		await userEvent.keyboard("{Escape}");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(opener).toHaveFocus();
	});

	it("does nothing, and does not crash, for a component used outside a provider", async () => {
		render(<Opener />);
		await userEvent.click(screen.getByRole("button", { name: "Open contact" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
