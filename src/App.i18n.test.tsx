import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "./App";

function at(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<App />
		</MemoryRouter>
	);
}

describe("App in Indonesian", () => {
	it("shows the home page in Indonesian under /id", () => {
		at("/id");
		expect(
			screen.getByRole("heading", { level: 1 }).getAttribute("aria-label")
		).toBe("Kami membuat game dari meja kami, untuk meja Anda.");
		expect(screen.getByRole("link", { name: "Lihat proyek" })).toHaveAttribute(
			"href",
			"/id/projects"
		);
	});

	it("keeps / in English", () => {
		at("/");
		expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute(
			"href",
			"/projects"
		);
	});

	it("shows the projects page in Indonesian, with links that stay in Indonesian", () => {
		at("/id/projects");
		expect(
			screen.getByRole("heading", { level: 1, name: "Proyek" })
		).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Semua" })).toBeInTheDocument();
		expect(screen.getAllByText("Aksi").length).toBeGreaterThan(0);
		expect(
			screen
				.getAllByRole("link")
				.some((a) => a.getAttribute("href") === "/id/projects/ketik-mancing")
		).toBe(true);
	});

	it("shows a project in Indonesian", () => {
		at("/id/projects/ketik-mancing");
		expect(
			screen.getByText("Sedang dikembangkan", { selector: "span" })
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute(
			"href",
			"/id/projects"
		);
	});

	it("shows the not found page in Indonesian", () => {
		at("/id/nowhere");
		expect(
			screen.getByRole("heading", { name: "Halaman tidak ditemukan" })
		).toBeInTheDocument();
	});

	it("opens the contact dialog in Indonesian", async () => {
		at("/id");
		await userEvent.click(screen.getAllByRole("button", { name: "Kontak" })[0]);
		expect(
			await screen.findByRole("dialog", { name: "Kontak" })
		).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Kirim" }));
		expect(screen.getByText("Masukkan nama Anda")).toBeInTheDocument();
	});
});
