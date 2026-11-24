import { useEffect, useRef } from "react";
import { cn } from "../../../lib/cn";

export type GlitchLevel = "idle" | "bzt" | "surge" | "burst";

interface CrtScreenProps {
	src: string;
	alt: string;
	/** Escalating analog TV interference level: idle -> bzt -> surge -> burst (transition). */
	glitchLevel?: GlitchLevel;
	/** Fit mode: `cover` for cards, `contain` for crisp gameplay monitor frames. */
	fit?: "cover" | "contain";
	fetchPriority?: "high" | "auto";
	loading?: "eager" | "lazy";
	className?: string;
	imgClassName?: string;
	children?: React.ReactNode;
}

const STATIC_NOISE_BG =
	"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Six full-width horizontal CRT scan bands that fracture independently left & right over black. */
const CRT_BANDS = [
	{ clip: "inset(0% 0 83% 0)", anim: "animate-crt-band-1", tint: false },
	{ clip: "inset(16.5% 0 66.5% 0)", anim: "animate-crt-band-2", tint: true },
	{ clip: "inset(33% 0 49.5% 0)", anim: "animate-crt-band-3", tint: false },
	{ clip: "inset(50% 0 33% 0)", anim: "animate-crt-band-4", tint: true },
	{ clip: "inset(66.5% 0 16.5% 0)", anim: "animate-crt-band-5", tint: false },
	{ clip: "inset(83% 0 0% 0)", anim: "animate-crt-band-6", tint: false },
] as const;

/**
 * Authentic retro analog CRT TV viewport:
 * - Clean sharp image during `idle`
 * - On slide change, plays a crisp CRT phosphor vertical lock-in enter animation
 * - During `bzt` -> `surge` -> `burst`, fractures the image itself into 6 horizontal
 *   bands tearing BOTH left & right over pure black with black scan-loss dropouts and
 *   momentary signal-loss blackout pulses
 */
export function CrtScreen({
	src,
	alt,
	glitchLevel = "idle",
	fit = "cover",
	fetchPriority = "auto",
	loading = "lazy",
	className,
	imgClassName,
	children,
}: CrtScreenProps): React.JSX.Element {
	const initialSrcRef = useRef(src);
	const hasSwitchedRef = useRef(false);
	if (src !== initialSrcRef.current) {
		hasSwitchedRef.current = true;
	}
	useEffect(() => {
		initialSrcRef.current = src;
	}, [src]);

	const fitClass =
		fit === "contain" ? "object-contain bg-ink-900" : "object-cover";
	const isGlitching = glitchLevel !== "idle";
	const glitchAmp =
		glitchLevel === "burst" ? 1.45 : glitchLevel === "surge" ? 1 : 0.55;
	const bandDuration =
		glitchLevel === "burst"
			? "0.26s"
			: glitchLevel === "surge"
				? "0.4s"
				: "0.78s";
	const staticOpacity =
		glitchLevel === "burst"
			? "opacity-45"
			: glitchLevel === "surge"
				? "opacity-22"
				: glitchLevel === "bzt"
					? "opacity-10"
					: "opacity-[0.02]";

	return (
		<div
			data-crt-screen=""
			data-glitch={glitchLevel}
			style={{ "--glitch-amp": glitchAmp } as React.CSSProperties}
			className={cn("relative overflow-hidden bg-black", className)}
		>
			{/* Base image wrapper: crisp enter lock-in animation whenever the slide changes */}
			<div
				key={src}
				className={cn(
					"size-full",
					hasSwitchedRef.current && "animate-crt-enter"
				)}
			>
				{/* Semantic base frame — hidden visually while 6 fractured bands take over so black dropouts show through */}
				<img
					src={src}
					alt={alt}
					fetchPriority={fetchPriority}
					loading={loading}
					decoding="async"
					className={cn(
						"size-full",
						fitClass,
						imgClassName,
						isGlitching && "opacity-0"
					)}
				/>

				{/* 6-band fractured image slices tearing both left & right with black tube gaps */}
				{isGlitching &&
					CRT_BANDS.map((band, idx) => (
						<img
							key={idx}
							src={src}
							alt=""
							aria-hidden="true"
							data-crt-band={idx + 1}
							className={cn(
								"pointer-events-none absolute inset-0 size-full",
								fitClass,
								band.anim
							)}
							style={{
								clipPath: band.clip,
								animationDuration: bandDuration,
								filter:
									band.tint && glitchLevel !== "bzt"
										? "contrast(1.22) saturate(1.3)"
										: undefined,
							}}
						/>
					))}

				{/* Warm phosphor ghost tear strip on surge/burst */}
				{(glitchLevel === "surge" || glitchLevel === "burst") && (
					<img
						src={src}
						alt=""
						aria-hidden="true"
						className={cn(
							"animate-crt-band-2 pointer-events-none absolute inset-0 size-full mix-blend-screen",
							fitClass,
							glitchLevel === "burst" ? "opacity-65" : "opacity-40"
						)}
						style={{
							clipPath: "inset(24% 0 58% 0)",
							animationDuration: "0.3s",
							filter: "sepia(0.8) saturate(3.2) hue-rotate(-22deg)",
						}}
					/>
				)}
			</div>

			{/* Momentary CRT signal-loss blackout pulse (darkens briefly & snaps back) */}
			{(glitchLevel === "surge" || glitchLevel === "burst") && (
				<div
					aria-hidden="true"
					data-crt-blackout=""
					className="animate-crt-blackout pointer-events-none absolute inset-0 bg-black"
					style={{
						animationDuration: glitchLevel === "burst" ? "0.28s" : "0.52s",
					}}
				/>
			)}

			{/* Horizontal sync-loss flash line right on channel switch burst */}
			{glitchLevel === "burst" && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-amber-300/80 shadow-[0_0_18px_4px_rgba(255,201,120,0.85)]"
				/>
			)}

			{/* Subtle rolling VHS tracking line */}
			<div
				aria-hidden="true"
				className="animate-crt-roll pointer-events-none absolute inset-x-0 top-0 h-4 bg-linear-to-b from-transparent via-white/8 to-transparent"
			/>

			{/* Stepped analog static snow (whisper-faint in idle, spikes into burst) */}
			<div
				aria-hidden="true"
				className={cn(
					"animate-crt-static pointer-events-none absolute -inset-6 transition-opacity duration-150",
					staticOpacity
				)}
				style={{ backgroundImage: STATIC_NOISE_BG }}
			/>

			{/* Subtle CRT scanlines + gentle glass tube vignette */}
			<div
				aria-hidden="true"
				className="crt-scanlines pointer-events-none absolute inset-0 opacity-16"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.34)]"
				style={{
					backgroundImage:
						"linear-gradient(135deg, rgb(255 255 255 / 0.04) 0%, transparent 32%)",
				}}
			/>

			{children}
		</div>
	);
}
