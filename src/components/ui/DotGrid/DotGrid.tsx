import { cn } from "../../../lib/cn";

interface DotGridProps {
	/**
	 * Adds an orange glow layer that follows the `--gx`/`--gy` variables set on an
	 * ancestor by `usePointerGlow`. Stays invisible until the pointer moves.
	 */
	interactive?: boolean;
	className?: string;
}

const GLOW_HALF = "11.25rem";
const DOT_SPACING = "28px";

/** A faint dot grid that fills its positioned parent, like the felt of a table. */
export function DotGrid({
	interactive = false,
	className,
}: DotGridProps): React.JSX.Element {
	return (
		<div
			aria-hidden="true"
			data-dot-grid=""
			className={cn(
				"pointer-events-none absolute inset-0 overflow-hidden",
				className
			)}
		>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(circle, var(--color-ink-200) 1px, transparent 1.5px)",
					backgroundSize: `${DOT_SPACING} ${DOT_SPACING}`,
				}}
			/>
			{interactive && (
				<div
					data-glow=""
					className="absolute top-0 left-0 size-90 transition-opacity duration-300"
					style={{
						translate: `calc(var(--gx, 50vw) - ${GLOW_HALF}) calc(var(--gy, 40vh) - ${GLOW_HALF})`,
						opacity: "var(--glow-on, 0)",
						backgroundImage:
							"radial-gradient(circle, var(--color-orange-500) 2px, transparent 2.5px), radial-gradient(circle closest-side, rgb(245 97 31 / 0.12), transparent)",
						backgroundSize: `${DOT_SPACING} ${DOT_SPACING}, 100% 100%`,
						backgroundPosition: `calc(${GLOW_HALF} - var(--gx, 0px)) calc(${GLOW_HALF} - var(--gy, 0px)), 0 0`,
						maskImage:
							"radial-gradient(circle closest-side, black 35%, transparent)",
						WebkitMaskImage:
							"radial-gradient(circle closest-side, black 35%, transparent)",
					}}
				/>
			)}
		</div>
	);
}
