import { useEffect, type RefObject } from "react";
import { canTrack, easeToward, normalize } from "./glow";

/**
 * Follows the pointer over `ref` and writes it as CSS variables on that element:
 * `--gx`/`--gy` (px from its top-left, eased), `--nx`/`--ny` (-1 to 1 across it)
 * and `--glow-on` (1 while the pointer is over it). Children style themselves
 * from the variables, so React never re-renders on a pointer move. Does nothing
 * on touch devices or when the visitor prefers reduced motion.
 */
export function usePointerGlow(
	ref: RefObject<HTMLElement | null>,
	ease = 0.14
): void {
	useEffect(() => {
		const element = ref.current;
		if (!element || !canTrack()) return;

		let target = { x: 0, y: 0 };
		let current = { x: 0, y: 0 };
		let frame = 0;
		let seeded = false;

		const write = () => {
			const { width, height } = element.getBoundingClientRect();
			element.style.setProperty("--gx", `${current.x}px`);
			element.style.setProperty("--gy", `${current.y}px`);
			element.style.setProperty("--nx", String(normalize(current.x, width)));
			element.style.setProperty("--ny", String(normalize(current.y, height)));
		};

		const tick = () => {
			current = {
				x: easeToward(current.x, target.x, ease),
				y: easeToward(current.y, target.y, ease),
			};
			write();
			const settled = current.x === target.x && current.y === target.y;
			frame = settled ? 0 : requestAnimationFrame(tick);
		};

		const onMove = (event: PointerEvent) => {
			const rect = element.getBoundingClientRect();
			target = { x: event.clientX - rect.left, y: event.clientY - rect.top };
			if (!seeded) {
				// First move: start under the pointer instead of sweeping in from the corner.
				current = { ...target };
				seeded = true;
			}
			element.style.setProperty("--glow-on", "1");
			if (!frame) frame = requestAnimationFrame(tick);
		};

		const onLeave = () => element.style.setProperty("--glow-on", "0");

		element.addEventListener("pointermove", onMove);
		element.addEventListener("pointerleave", onLeave);
		return () => {
			cancelAnimationFrame(frame);
			element.removeEventListener("pointermove", onMove);
			element.removeEventListener("pointerleave", onLeave);
		};
	}, [ref, ease]);
}
