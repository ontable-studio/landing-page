/**
 * Project content for the Projects and detail pages: the one place to edit it.
 *
 * Still to fill in (ask the team, do not guess): `year`, a "Date"/"Role" credit,
 * and the "Platform" credit for every project except Craftboard Heroes.
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
	/** Shown in the corner of the card and over the detail hero; hidden until known. */
	year?: number;
	summary: string;
	/** Cover picture, used on the card and as the detail hero. */
	image?: string;
	credits: { label: string; value: string }[];
	gallery: { src?: string; alt: string }[];
}

const img = (slug: string, file: string) =>
	`/images/projects/${slug}/${file}.webp`;

export const projects: Project[] = [
	{
		slug: "craftboard-heroes",
		title: "Craftboard Heroes",
		type: "Game",
		category: "Action",
		summary:
			"An action game about turning a child's imagination into real power. Fight waves of playground monsters in a world made of cardboard, then trigger Quick Draw: time slows while you trace a blueprint, and the weapon you drew materializes.",
		image: img("craftboard-heroes", "01-title"),
		credits: [{ label: "Platform", value: "WebGL (HTML), Desktop" }],
		gallery: [
			{
				src: img("craftboard-heroes", "02-main-menu"),
				alt: "The Craftboard Heroes main menu, with the hero standing in a playground",
			},
			{
				src: img("craftboard-heroes", "03-combat"),
				alt: "Fighting playground monsters inside a fenced sandbox arena",
			},
			{
				src: img("craftboard-heroes", "04-quick-draw-popup"),
				alt: "The Quick Draw canvas open over the battlefield during a boss fight",
			},
			{
				src: img("craftboard-heroes", "05-about-the-game"),
				alt: "About the game: turning a child's wildest imagination into real power",
			},
			{
				src: img("craftboard-heroes", "06-quick-draw-steps"),
				alt: "Quick Draw in four steps: press a key, trace the blueprint, slow time, the weapon appears",
			},
		],
	},
	{
		slug: "ketik-mancing",
		title: "Ketik Mancing",
		type: "Game",
		category: "Typing",
		summary:
			"A casual fishing game you play with the keyboard, in Indonesian. Type the words that appear to hook fish, collect bait by typing the words on worms before time runs out, and fill a fish journal with each catch's habitat, length, rarity and weight across several fishing spots.",
		image: img("ketik-mancing", "01-title"),
		credits: [],
		gallery: [
			{
				src: img("ketik-mancing", "02-main-menu"),
				alt: "The Ketik Mancing main menu, with a fisherman on his boat",
			},
			{
				src: img("ketik-mancing", "03-village-bridge"),
				alt: "The village bridge fishing spot, with time, bait and catch counters",
			},
			{
				src: img("ketik-mancing", "04-bait-worms"),
				alt: "Typing the words on worms to collect bait",
			},
			{
				src: img("ketik-mancing", "05-typing-to-fish"),
				alt: "Typing a sentence to reel in a fish",
			},
			{
				src: img("ketik-mancing", "06-catch-result"),
				alt: "A caught fish shown with its rarity stars",
			},
			{
				src: img("ketik-mancing", "07-fish-journal"),
				alt: "The fish journal open to two species, with habitat, length and weight",
			},
			{
				src: img("ketik-mancing", "08-location-select"),
				alt: "Choosing the next fishing location",
			},
		],
	},
	{
		slug: "laundry-kita",
		title: "Laundry Kita",
		type: "Game",
		category: "Simulation",
		summary:
			"A management simulation about running a laundry shop in a small isometric city. Keep an eye on your money, the days and the hours, shop for supplies, and arrange the machines and furniture inside the shop.",
		image: img("laundry-kita", "01-title"),
		credits: [],
		gallery: [
			{
				src: img("laundry-kita", "02-shop-interior"),
				alt: "Inside the laundry shop, with machines, shelves and a counter",
			},
			{
				src: img("laundry-kita", "03-city-street"),
				alt: "The city block around the shop",
			},
			{
				src: img("laundry-kita", "04-shop-layout"),
				alt: "A top-down view of the shop layout, with shop, items and save buttons",
			},
		],
	},
	{
		slug: "oxshiftgen",
		title: "OxShiftGen",
		type: "Game",
		category: "Co-op",
		summary:
			"A two-player game set in an industrial facility. Each player wears a gas mask with its own oxygen meter, and together you carry oxygen canisters, work the switches and cross the platforms.",
		image: img("oxshiftgen", "01-title"),
		credits: [],
		gallery: [
			{
				src: img("oxshiftgen", "02-carrying-canister"),
				alt: "Two players with an oxygen canister on a platform, each with an oxygen meter on screen",
			},
			{
				src: img("oxshiftgen", "03-platform-room"),
				alt: "A platform room with pads and switches",
			},
			{
				src: img("oxshiftgen", "04-ledge-route"),
				alt: "A player making their way along a ledge",
			},
		],
	},
];

/** The project types in use, once each, in order of first appearance. */
export const projectTypes: ProjectType[] = [
	...new Set(projects.map((project) => project.type)),
];

export function getProject(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
