import { cn } from "../../../lib/cn";

interface SectionFrameProps {
	children: React.ReactNode;
	/** Surface class for the solid interactive inner canvas (e.g. `bg-cream`, `bg-parchment`, `bg-ink-900`). */
	surfaceClass: string;
	/** Use dark-mode border & hatching tones for `bg-ink-900` bands. */
	dark?: boolean;
	/** Extra classes applied to the outer hatched full-bleed band. */
	outerClassName?: string;
	/** Extra classes applied to the inner framed `max-w-7xl` content canvas. */
	innerClassName?: string;
	/** Render pixel-centered diamond nodes (`◆`) on the top rail intersections. */
	marksTop?: boolean;
	/** Render pixel-centered diamond nodes (`◆`) on the bottom rail intersections. */
	marksBottom?: boolean;
	/** Override diamond tone on the top rail intersections (defaults to `dark` prop). */
	marksTopDark?: boolean;
	/** Override diamond tone on the bottom rail intersections (defaults to `dark` prop). */
	marksBottomDark?: boolean;
}

/**
 * Crisp geometric diamond node centered mathematically on the 1px vertical rail
 * and horizontal border seam (`left-[-0.5px] -translate-x-1/2`).
 */
function CornerDiamond({
	position,
	dark,
}: {
	position: string;
	dark: boolean;
}): React.JSX.Element {
	return (
		<span
			aria-hidden="true"
			data-rail-diamond=""
			className={cn(
				"pointer-events-none absolute z-20 hidden size-2.25 rotate-45 border select-none min-[1320px]:block",
				dark ? "border-ink-400 bg-ink-900" : "border-ink-900/45 bg-parchment",
				position
			)}
		/>
	);
}

/**
 * Architectural 3-zone section container running edge-to-edge across the entire site:
 * - Outer left & right gutters outside `max-w-7xl` show a diagonal hatch pattern
 *   clearly marking non-interactive margins.
 * - Inner `max-w-7xl` canvas sits on a solid surface bounded by crisp 1px vertical rails.
 * - Optional diamond nodes sit pixel-centered on the top/bottom border intersections.
 */
export function SectionFrame({
	children,
	surfaceClass,
	dark = false,
	outerClassName,
	innerClassName,
	marksTop = false,
	marksBottom = false,
	marksTopDark,
	marksBottomDark,
}: SectionFrameProps): React.JSX.Element {
	const railBorder = dark ? "border-white/14" : "border-ink-900/15";
	const topDiamondDark = marksTopDark ?? dark;
	const bottomDiamondDark = marksBottomDark ?? dark;

	return (
		<div
			className={cn(
				"relative w-full",
				surfaceClass,
				dark ? "hatch-gutter-dark" : "hatch-gutter",
				outerClassName
			)}
		>
			<div
				className={cn(
					"relative mx-auto w-full max-w-7xl min-[1320px]:border-x",
					surfaceClass,
					railBorder,
					innerClassName
				)}
			>
				{marksTop && (
					<>
						<CornerDiamond
							position="-top-[0.5px] -left-[0.5px] -translate-x-1/2 -translate-y-1/2"
							dark={topDiamondDark}
						/>
						<CornerDiamond
							position="-top-[0.5px] -right-[0.5px] translate-x-1/2 -translate-y-1/2"
							dark={topDiamondDark}
						/>
					</>
				)}
				{marksBottom && (
					<>
						<CornerDiamond
							position="-bottom-[0.5px] -left-[0.5px] -translate-x-1/2 translate-y-1/2"
							dark={bottomDiamondDark}
						/>
						<CornerDiamond
							position="-bottom-[0.5px] -right-[0.5px] translate-x-1/2 translate-y-1/2"
							dark={bottomDiamondDark}
						/>
					</>
				)}
				{children}
			</div>
		</div>
	);
}
