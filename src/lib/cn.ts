import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — class-name merge utility.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 * When the design system adds custom `--text-*` tokens, register them with
 * `extendTailwindMerge` here.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
