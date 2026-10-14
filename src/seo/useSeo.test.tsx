import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { projects } from "../data/projects";
import type { Route } from "./pages";
import { useSeo } from "./useSeo";

function Probe({ route }: { route: Route }) {
	useSeo(route);
	return null;
}

const content = (selector: string) =>
	document.head.querySelector(selector)?.getAttribute("content");
const href = (selector: string) =>
	document.head.querySelector(selector)?.getAttribute("href");
const jsonLd = () =>
	[...document.head.querySelectorAll('script[type="application/ld+json"]')].map(
		(s) => JSON.parse(s.textContent ?? "{}")
	);

afterEach(() => {
	document.head
		.querySelectorAll(
			'meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"]'
		)
		.forEach((el) => el.remove());
	document.title = "";
});

describe("useSeo", () => {
	it("sets the title, description, robots and canonical for the page", () => {
		render(<Probe route={{ name: "projects" }} />);
		expect(document.title).toBe("Projects — OnTable Studio");
		expect(content('meta[name="description"]')).toMatch(/Games and projects/);
		expect(content('meta[name="robots"]')).toBe("index, follow");
		expect(href('link[rel="canonical"]')).toBe(
			"https://landing-page-ontable.vercel.app/projects"
		);
	});

	it("sets Open Graph and Twitter tags with an absolute image", () => {
		const project = projects[0];
		render(<Probe route={{ name: "project", project }} />);
		expect(content('meta[property="og:title"]')).toBe(document.title);
		expect(content('meta[property="og:url"]')).toBe(
			`https://landing-page-ontable.vercel.app/projects/${project.slug}`
		);
		expect(content('meta[property="og:image"]')).toBe(
			`https://landing-page-ontable.vercel.app/og/${project.slug}.jpg`
		);
		expect(content('meta[name="twitter:card"]')).toBe("summary_large_image");
		expect(content('meta[name="twitter:image"]')).toBe(
			content('meta[property="og:image"]')
		);
	});

	it("marks the design system and the not-found page noindex", () => {
		const { rerender } = render(<Probe route={{ name: "design-system" }} />);
		expect(content('meta[name="robots"]')).toBe("noindex, nofollow");
		rerender(<Probe route={{ name: "not-found" }} />);
		expect(content('meta[name="robots"]')).toBe("noindex, nofollow");
	});

	it("updates the same tags on navigation instead of adding more", () => {
		const { rerender } = render(<Probe route={{ name: "home" }} />);
		rerender(<Probe route={{ name: "projects" }} />);
		expect(document.title).toBe("Projects — OnTable Studio");
		expect(
			document.head.querySelectorAll('meta[name="description"]')
		).toHaveLength(1);
		expect(
			document.head.querySelectorAll('link[rel="canonical"]')
		).toHaveLength(1);
		expect(
			document.head.querySelectorAll('meta[property="og:title"]')
		).toHaveLength(1);
	});

	it("keeps tags that already exist, such as the ones the build wrote", () => {
		const existing = document.createElement("meta");
		existing.setAttribute("name", "description");
		existing.setAttribute("content", "from the build");
		document.head.append(existing);
		render(<Probe route={{ name: "home" }} />);
		expect(
			document.head.querySelectorAll('meta[name="description"]')
		).toHaveLength(1);
		expect(existing.getAttribute("content")).toMatch(
			/OnTable Studio is a small team/
		);
	});

	it("swaps the JSON-LD for the page's own, replacing what the build wrote", () => {
		const built = document.createElement("script");
		built.type = "application/ld+json";
		built.textContent = '{"@type":"Stale"}';
		document.head.append(built);
		const { rerender } = render(<Probe route={{ name: "home" }} />);
		expect(jsonLd().map((d) => d["@type"])).toEqual([
			"Organization",
			"WebSite",
		]);
		rerender(<Probe route={{ name: "project", project: projects[0] }} />);
		expect(jsonLd().map((d) => d["@type"])).toEqual([
			"VideoGame",
			"BreadcrumbList",
		]);
	});

	it("leaves no JSON-LD on a page that has none", () => {
		const { rerender } = render(<Probe route={{ name: "home" }} />);
		rerender(<Probe route={{ name: "design-system" }} />);
		expect(jsonLd()).toEqual([]);
	});
});
