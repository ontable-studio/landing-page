/**
 * Project content for the Projects and detail pages.
 * These entries are placeholders: replace them with the real games and tools.
 */
export interface Project {
	slug: string;
	title: string;
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
		category: "Game Jam",
		year: 2024,
		summary:
			"A placeholder game jam entry with no credits or gallery, to exercise the empty case.",
		credits: [],
		gallery: [],
	},
];

export function getProject(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
