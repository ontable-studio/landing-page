/** One step of easing: moves `current` a fraction `factor` of the way to `target`, snapping when close. */
export function easeToward(
	current: number,
	target: number,
	factor: number,
	epsilon = 0.1
): number {
	const next = current + (target - current) * factor;
	return Math.abs(target - next) < epsilon ? target : next;
}

/** Maps `value` within `0..size` to `-1..1`, clamped. An empty box maps to 0. */
export function normalize(value: number, size: number): number {
	if (size <= 0) return 0;
	return Math.max(-1, Math.min(1, (value / size) * 2 - 1));
}

/**
 * Whether pointer-following effects should run: a fine pointer that can hover.
 * A reduced-motion request is ignored unless `<html>` carries
 * `data-respect-reduced-motion` (the one switch for the whole site, see index.html).
 */
export function canTrack(): boolean {
	if (typeof matchMedia !== "function") return false;
	const respectsReducedMotion = document.documentElement.hasAttribute(
		"data-respect-reduced-motion"
	);
	if (
		respectsReducedMotion &&
		matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		return false;
	}
	return matchMedia("(hover: hover) and (pointer: fine)").matches;
}
