import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrtProvider, useCrt } from "./CrtProvider";

function ToggleProbe() {
	const { enabled, toggle } = useCrt();
	return (
		<button type="button" onClick={toggle}>
			CRT {enabled ? "ON" : "OFF"}
		</button>
	);
}

describe("CrtProvider", () => {
	it("renders the subtle scanline & vignette overlay by default and toggles it off", async () => {
		const { container } = render(
			<CrtProvider>
				<ToggleProbe />
			</CrtProvider>
		);
		expect(container.querySelector("[data-crt-overlay]")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "CRT ON" }));
		expect(container.querySelector("[data-crt-overlay]")).toBeNull();
		expect(screen.getByRole("button", { name: "CRT OFF" })).toBeInTheDocument();
	});
});
