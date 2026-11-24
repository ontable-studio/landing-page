import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SITE } from "../common/constants";
import { ContactProvider } from "../components/layout/Contact";
import { projects } from "../data/projects";
import Home from "./Home";

function setup() {
	return render(
		<MemoryRouter>
			<ContactProvider>
				<Home />
			</ContactProvider>
		</MemoryRouter>
	);
}

describe("Home", () => {
	it("shows the tagline as the page heading", () => {
		setup();
		expect(
			screen.getByRole("heading", { level: 1, name: SITE.tagline })
		).toBeInTheDocument();
	});

	it("provides a skip-to-main-content link targeting #main-content", () => {
		setup();
		const skip = screen.getByRole("link", { name: "Skip to main content" });
		expect(skip).toHaveAttribute("href", "#main-content");
		expect(document.getElementById("main-content")).toBeInTheDocument();
	});

	it("links to the projects", () => {
		setup();
		expect(
			screen.getAllByRole("link", { name: "View projects" })[0]
		).toHaveAttribute("href", "/projects");
	});

	it("has Contact buttons that open the contact dialog instead of linking away", async () => {
		setup();
		const buttons = screen.getAllByRole("button", { name: "Contact" });
		expect(buttons.length).toBeGreaterThanOrEqual(2);
		expect(
			screen.queryByRole("link", { name: "Contact" })
		).not.toBeInTheDocument();
		await userEvent.click(buttons[1]);
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeInTheDocument();
	});

	it("sets the tab title", () => {
		setup();
		expect(document.title).toBe(
			"OnTable Studio: a small game development team"
		);
	});

	it("raises the headline in two masked lines that join into the tagline", () => {
		const { container } = setup();
		const lines = [...container.querySelectorAll("h1 [data-line]")];
		expect(lines).toHaveLength(2);
		expect(lines.map((l) => l.textContent?.trim()).join(" ")).toBe(
			SITE.tagline
		);
		for (const line of lines) {
			expect(line.className).toContain("animate-line-rise");
		}
	});

	it("leaves room under every masked line for descenders like g and y", () => {
		const { container } = setup();
		const masks = [...container.querySelectorAll("h1 > span")];
		expect(masks).toHaveLength(2);
		for (const mask of masks) {
			expect(mask.className).toContain("pb-[0.2em]");
			expect(mask.className).toContain("mb-[-0.2em]");
		}
	});

	it("uses a clean broadsheet hero with no dot-grid spotlight or mouse-drift", () => {
		const { container } = setup();
		const hero = container.querySelector("[data-hero-home]") as HTMLElement;
		expect(hero).toBeInTheDocument();
		expect(hero.querySelector("[data-dot-grid]")).toBeNull();
		expect(hero.querySelector("[data-glow]")).toBeNull();
		const deck = container.querySelector("[data-tabletop-deck]") as HTMLElement;
		expect(deck.getAttribute("style")).toBeNull();
	});

	it("has exactly one fixed parchment nav and one site footer", () => {
		const { container } = setup();
		const nav = container.querySelector("nav");
		expect(container.querySelectorAll("nav")).toHaveLength(1);
		expect(container.querySelectorAll("footer")).toHaveLength(1);
		expect(nav?.className).toMatch(/\bfixed\b/);
		expect(nav?.className).toMatch(/bg-parchment/);
		expect(nav?.className).not.toMatch(/backdrop-blur/);
	});

	it("shuffles the top card to the back of the physical 4-card hero stack", async () => {
		const { container } = setup();
		const deck = container.querySelector("[data-tabletop-deck]") as HTMLElement;
		expect(
			within(deck).getByRole("heading", { name: projects[0].title })
		).toBeInTheDocument();
		expect(deck.querySelectorAll("[data-stack-card]")).toHaveLength(
			projects.length
		);

		const nextBtn = within(deck).getByRole("button", {
			name: "Next featured project",
		});
		await userEvent.click(nextBtn);
		expect(
			await within(deck).findByRole("heading", { name: projects[1].title })
		).toBeInTheDocument();

		const cards = [...deck.querySelectorAll("[data-stack-card]")];
		// Previous top card (index 0) moved to the back slot (length - 1).
		expect(cards[0]).toHaveAttribute("data-slot", String(projects.length - 1));
		expect(cards[1]).toHaveAttribute("data-slot", "0");
	});

	it("renders the kinetic studio marquee ribbon", () => {
		const { container } = setup();
		expect(container.querySelector("[data-marquee]")).toBeInTheDocument();
	});

	it("switches screenshots in the dark interactive studio craft showcase", async () => {
		const { container } = setup();
		const craft = container.querySelector(
			"[data-craft-showcase]"
		) as HTMLElement;
		expect(craft).toBeInTheDocument();
		const systemsBtn = within(craft).getByRole("button", {
			name: /gameplay & systems/i,
		});
		await userEvent.click(systemsBtn);
		expect(systemsBtn).toHaveAttribute("aria-pressed", "true");
		expect(
			within(craft).getByRole("link", { name: /see in oxshiftgen/i })
		).toHaveAttribute("href", "/projects/oxshiftgen");
	});

	it("renders the FAQ accordion and toggles answers", async () => {
		const { container } = setup();
		const faq = container.querySelector("[data-faq]") as HTMLElement;
		const secondQ = within(faq).getByRole("button", {
			name: /what platforms and formats/i,
		});
		expect(secondQ).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(secondQ);
		expect(secondQ).toHaveAttribute("aria-expanded", "true");
	});

	it("showcases all studio projects across the page", () => {
		setup();
		for (const project of projects) {
			const links = screen
				.getAllByRole("link")
				.filter((a) => a.getAttribute("href") === `/projects/${project.slug}`);
			expect(links.length).toBeGreaterThanOrEqual(1);
		}
	});

	it("describes the page for search engines and social cards", () => {
		setup();
		expect(
			document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")
		).toBe("https://landing-page-ontable.vercel.app/");
		expect(
			document.head
				.querySelector('meta[name="robots"]')
				?.getAttribute("content")
		).toBe("index, follow");
		expect(
			document.head
				.querySelector('meta[property="og:image"]')
				?.getAttribute("content")
		).toBe("https://landing-page-ontable.vercel.app/og/default.jpg");
	});
});
