import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Custom `--text-*` font-size tokens from `@theme` in main.css. */
const TEXT_SIZE_TOKENS = [
	"display",
	"h1",
	"h2",
	"h3",
	"h4",
	"title",
	"body-lg",
	"body",
	"body-sm",
	"label",
	"caption",
];

const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [{ text: TEXT_SIZE_TOKENS }],
		},
	},
});

/**
 * cn() — class-name merge utility.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
