import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { useDocumentTitle } from "./useDocumentTitle";

function Probe({ title }: { title: string }) {
	useDocumentTitle(title);
	return null;
}

describe("useDocumentTitle", () => {
	it("sets the document title", () => {
		render(<Probe title="Projects — OnTable" />);
		expect(document.title).toBe("Projects — OnTable");
	});

	it("updates the title when it changes", () => {
		const { rerender } = render(<Probe title="One" />);
		rerender(<Probe title="Two" />);
		expect(document.title).toBe("Two");
	});
});
