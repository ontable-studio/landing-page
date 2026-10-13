/**
 * Project content for the Projects and detail pages.
 * These entries are placeholders: replace them with the real games and tools.
 */
export const PROJECT_TYPES = ["Game", "Tool", "UI Design"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface Project {
	slug: string;
	title: string;
	/** Filter group on the Projects page. */
	type: ProjectType;
	/** Genre or kind, shown on the card. */
	category: string;
	year: number;
	summary: string;
	image?: string;
	credits: { label: string; value: string }[];
	gallery: { src?: string; alt: string }[];
}

export const projects: Project[] = [
	{
		slug: "placeholder-game-one",
		title: "Placeholder Game One",
		type: "Game",
		category: "Puzzle",
		year: 2026,
		summary:
			"A placeholder puzzle game. Replace this text with a short description of the real project.",
		credits: [
			{ label: "Date", value: "2026" },
			{ label: "Role", value: "Design, Programming" },
			{ label: "Platform", value: "PC" },
		],
		gallery: [
			{ alt: "Placeholder screenshot one" },
			{ alt: "Placeholder screenshot two" },
		],
	},
	{
		slug: "placeholder-game-two",
		title: "Placeholder Game Two",
		type: "Game",
		category: "Platformer",
		year: 2025,
		summary:
			"A placeholder platformer. Replace this text with a short description of the real project.",
		credits: [
			{ label: "Date", value: "2025" },
			{ label: "Role", value: "Design, Art" },
			{ label: "Platform", value: "PC, Mobile" },
		],
		gallery: [
			{ alt: "Placeholder screenshot one" },
			{ alt: "Placeholder screenshot two" },
			{ alt: "Placeholder screenshot three" },
		],
	},
	{
		slug: "placeholder-tool",
		title: "Placeholder Tool",
		type: "Tool",
		category: "Tool",
		year: 2025,
		summary:
			"A placeholder internal tool. Replace this text with a short description of the real project.",
		credits: [
			{ label: "Date", value: "2025" },
			{ label: "Role", value: "Programming" },
		],
		gallery: [{ alt: "Placeholder screenshot one" }],
	},
	{
		slug: "placeholder-jam-entry",
		title: "Placeholder Jam Entry",
		type: "Game",
		category: "Game Jam",
		year: 2024,
		summary:
			"A placeholder game jam entry with no credits or gallery, to exercise the empty case.",
		credits: [],
		gallery: [],
	},
	{
		slug: "placeholder-ui-kit",
		title: "Placeholder UI Kit",
		type: "UI Design",
		category: "Interface",
		year: 2025,
		summary:
			"A placeholder UI design project. Replace this text with a short description of the real project.",
		credits: [
			{ label: "Date", value: "2025" },
			{ label: "Role", value: "UI Design" },
		],
		gallery: [{ alt: "Placeholder screenshot one" }],
	},
];

/** The project types in use, once each, in order of first appearance. */
export const projectTypes: ProjectType[] = [
	...new Set(projects.map((project) => project.type)),
];

export function getProject(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
