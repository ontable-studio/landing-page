/** Mirrors the colour and type tokens in src/styles/main.css. */
export interface Swatch {
	token: string;
	hex: string;
}

export const colorGroups: { name: string; swatches: Swatch[] }[] = [
	{
		name: "Orange (brand)",
		swatches: [
			{ token: "orange-50", hex: "#fff3ec" },
			{ token: "orange-100", hex: "#ffe0cf" },
			{ token: "orange-200", hex: "#ffc2a1" },
			{ token: "orange-300", hex: "#ff9d68" },
			{ token: "orange-400", hex: "#fa7b3c" },
			{ token: "orange-500", hex: "#f5611f" },
			{ token: "orange-600", hex: "#dc4a0f" },
			{ token: "orange-700", hex: "#b53a0c" },
			{ token: "orange-800", hex: "#8f2f0e" },
			{ token: "orange-900", hex: "#6e260f" },
		],
	},
	{
		name: "Ink (neutrals)",
		swatches: [
			{ token: "ink-50", hex: "#f7f5f3" },
			{ token: "ink-100", hex: "#ebe7e3" },
			{ token: "ink-200", hex: "#d6d0c9" },
			{ token: "ink-300", hex: "#b3aba2" },
			{ token: "ink-400", hex: "#8c847b" },
			{ token: "ink-500", hex: "#6b645c" },
			{ token: "ink-600", hex: "#524c46" },
			{ token: "ink-700", hex: "#3b3733" },
			{ token: "ink-800", hex: "#272421" },
			{ token: "ink-900", hex: "#171513" },
		],
	},
	{
		name: "Semantic",
		swatches: [
			{ token: "brand", hex: "#f5611f" },
			{ token: "brand-hover", hex: "#dc4a0f" },
			{ token: "canvas", hex: "#ffffff" },
			{ token: "surface", hex: "#f7f5f3" },
			{ token: "surface-border", hex: "#ebe7e3" },
			{ token: "text-primary", hex: "#171513" },
			{ token: "text-secondary", hex: "#6b645c" },
			{ token: "text-tertiary", hex: "#b3aba2" },
		],
	},
];

export const typeScale: {
	token: string;
	className: string;
	size: string;
	sample: string;
}[] = [
	{
		token: "display",
		className: "text-display font-display",
		size: "88/88",
		sample: "We make games",
	},
	{
		token: "h1",
		className: "text-h1 font-display",
		size: "56/59",
		sample: "From our table",
	},
	{
		token: "h2",
		className: "text-h2 font-display",
		size: "44/48",
		sample: "To your table",
	},
	{
		token: "h3",
		className: "text-h3 font-display",
		size: "32/37",
		sample: "Small team, big play",
	},
	{
		token: "h4",
		className: "text-h4 font-display",
		size: "24/30",
		sample: "Products and projects",
	},
	{
		token: "title",
		className: "text-title font-semibold",
		size: "20/26",
		sample: "Title in Instrument Sans",
	},
	{
		token: "body-lg",
		className: "text-body-lg",
		size: "20/28",
		sample: "Large body copy for introductions and leads.",
	},
	{
		token: "body",
		className: "text-body",
		size: "16/24",
		sample: "Body copy for paragraphs and descriptions.",
	},
	{
		token: "body-sm",
		className: "text-body-sm",
		size: "14/21",
		sample: "Small body copy for secondary information.",
	},
	{
		token: "label",
		className: "text-label font-mono font-medium tracking-wide uppercase",
		size: "12/16",
		sample: "Label in mono",
	},
	{
		token: "caption",
		className: "text-caption",
		size: "12/17",
		sample: "Caption for fine print and credits.",
	},
];
