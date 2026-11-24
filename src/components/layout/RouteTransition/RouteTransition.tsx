import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import { getProject } from "../../../data/projects";

type Phase = "idle" | "entering" | "holding" | "exiting";

function titleCase(slug: string): string {
	return slug
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

/** Formats a target pathname as a clean `OnTable - <Title>` label. */
export function channelLabelFor(pathname: string): string {
	const clean = pathname.replace(/^\/id(?=\/|$)/, "") || "/";
	if (clean === "/") return "OnTable - Home";
	if (clean === "/projects") return "OnTable - Projects";
	if (clean.startsWith("/projects/")) {
		const slug = clean.slice("/projects/".length);
		const project = getProject(slug);
		return `OnTable - ${project ? project.title : titleCase(slug)}`;
	}
	if (clean === "/design-system") return "OnTable - Design System";
	return "OnTable Studio";
}

function splitLabel(label: string): { brand: string; target: string } {
	const idx = label.indexOf(" - ");
	if (idx === -1) return { brand: "OnTable Studio", target: label };
	return {
		brand: label.slice(0, idx),
		target: label.slice(idx + 3),
	};
}

interface RallyShot {
	from: "L" | "R";
	yStart: number;
	xBounce: number;
	yBounce: number;
	yEnd: number;
	/** Shot duration in ms — faster shots naturally stretch the dotted trajectory tail. */
	duration: number;
	arcPeak: number;
	curve: number;
}

/**
 * Four distinct table-tennis rally sets picked randomly on every page transition
 * so the loading rally never repeats monotonously. Every shot's `yEnd` matches
 * the next shot's `yStart` for mathematically continuous contact.
 */
const RALLY_SETS: readonly RallyShot[][] = [
	// Set 0: Cross-Court Topspin Rally
	[
		{
			from: "L",
			yStart: 26,
			xBounce: 75,
			yBounce: 68,
			yEnd: 74,
			duration: 600,
			arcPeak: 0.95,
			curve: -4,
		},
		{
			from: "R",
			yStart: 74,
			xBounce: 25,
			yBounce: 30,
			yEnd: 24,
			duration: 540,
			arcPeak: 0.9,
			curve: 4,
		},
		{
			from: "L",
			yStart: 24,
			xBounce: 79,
			yBounce: 76,
			yEnd: 80,
			duration: 480,
			arcPeak: 0.82,
			curve: -3,
		},
		{
			from: "R",
			yStart: 80,
			xBounce: 22,
			yBounce: 32,
			yEnd: 26,
			duration: 580,
			arcPeak: 1.0,
			curve: 3,
		},
	],
	// Set 1: Down-the-Line Drive & Diagonal Counter
	[
		{
			from: "L",
			yStart: 22,
			xBounce: 77,
			yBounce: 24,
			yEnd: 25,
			duration: 520,
			arcPeak: 0.86,
			curve: -3,
		},
		{
			from: "R",
			yStart: 25,
			xBounce: 26,
			yBounce: 74,
			yEnd: 80,
			duration: 430,
			arcPeak: 0.76,
			curve: 5,
		},
		{
			from: "L",
			yStart: 80,
			xBounce: 76,
			yBounce: 77,
			yEnd: 75,
			duration: 500,
			arcPeak: 0.84,
			curve: 3,
		},
		{
			from: "R",
			yStart: 75,
			xBounce: 24,
			yBounce: 27,
			yEnd: 22,
			duration: 580,
			arcPeak: 0.96,
			curve: -4,
		},
	],
	// Set 2: High-Speed Power Smash Duel
	[
		{
			from: "L",
			yStart: 50,
			xBounce: 78,
			yBounce: 26,
			yEnd: 22,
			duration: 450,
			arcPeak: 0.78,
			curve: -4,
		},
		{
			from: "R",
			yStart: 22,
			xBounce: 23,
			yBounce: 74,
			yEnd: 79,
			duration: 390,
			arcPeak: 0.7,
			curve: 4,
		},
		{
			from: "L",
			yStart: 79,
			xBounce: 80,
			yBounce: 28,
			yEnd: 24,
			duration: 400,
			arcPeak: 0.72,
			curve: -5,
		},
		{
			from: "R",
			yStart: 24,
			xBounce: 26,
			yBounce: 48,
			yEnd: 50,
			duration: 500,
			arcPeak: 0.88,
			curve: 3,
		},
	],
	// Set 3: Short Net Drop & Flick Counter
	[
		{
			from: "L",
			yStart: 36,
			xBounce: 62,
			yBounce: 58,
			yEnd: 64,
			duration: 700,
			arcPeak: 1.12,
			curve: -5,
		},
		{
			from: "R",
			yStart: 64,
			xBounce: 22,
			yBounce: 24,
			yEnd: 20,
			duration: 440,
			arcPeak: 0.76,
			curve: 5,
		},
		{
			from: "L",
			yStart: 20,
			xBounce: 76,
			yBounce: 72,
			yEnd: 76,
			duration: 560,
			arcPeak: 0.92,
			curve: -3,
		},
		{
			from: "R",
			yStart: 76,
			xBounce: 32,
			yBounce: 42,
			yEnd: 36,
			duration: 620,
			arcPeak: 1.04,
			curve: 4,
		},
	],
];

const BOUNCE_U = 0.7;
const Z_HIT = 0.34;
const TRAIL_DOT_COUNT = 10;
const TRAIL_STEP_MS = 20;

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function smoothstep(t: number): number {
	const c = Math.max(0, Math.min(1, t));
	return c * c * (3 - 2 * c);
}

function restYFor(hitY: number): number {
	return lerp(hitY, 50, 0.32);
}

interface BallSample {
	x: number;
	y: number;
	z: number;
	shotIndex: number;
	shot: RallyShot;
	u: number;
}

/**
 * Evaluates exact C0-continuous ball coordinates (`0..100%` table space) and height `z`:
 * - `z = Z_HIT` at BOTH bat strike (`u = 0`) and bat arrival (`u = 1`) -> zero height snap on contact!
 * - `z = 0` right at the tabletop bounce (`u = BOUNCE_U`).
 */
function sampleRally(shots: readonly RallyShot[], tMs: number): BallSample {
	const total = shots.reduce((sum, s) => sum + s.duration, 0);
	let wrapped = ((tMs % total) + total) % total;
	let shotIndex = 0;
	for (let i = 0; i < shots.length; i++) {
		if (wrapped < shots[i].duration) {
			shotIndex = i;
			break;
		}
		wrapped -= shots[i].duration;
	}
	const shot = shots[shotIndex];
	const u = wrapped / shot.duration;
	const xStart = shot.from === "L" ? 11.5 : 88.5;
	const xEnd = shot.from === "L" ? 88.5 : 11.5;

	if (u <= BOUNCE_U) {
		const p = u / BOUNCE_U;
		const x = lerp(xStart, shot.xBounce, p);
		const y =
			lerp(shot.yStart, shot.yBounce, p) + Math.sin(p * Math.PI) * shot.curve;
		const z = (1 - p) * Z_HIT + Math.sin(p * Math.PI) * shot.arcPeak;
		return { x, y, z, shotIndex, shot, u };
	}

	const q = (u - BOUNCE_U) / (1 - BOUNCE_U);
	const x = lerp(shot.xBounce, xEnd, q);
	const y = lerp(shot.yBounce, shot.yEnd, q);
	const z = Math.sin(q * Math.PI * 0.5) * Z_HIT;
	return { x, y, z, shotIndex, shot, u };
}

/**
 * Precision vector table-tennis racket (Butterfly / Stiga flared-handle silhouette):
 * - Baked vector shadow inside SVG (avoids expensive per-frame CSS `drop-shadow` re-rasterization)
 * - Smooth anatomical blade-to-throat curve + flared laminated wooden handle + butt-cap
 */
function PingPongBat({
	side,
	bladeColor,
	bladeDark,
	rimColor,
}: {
	side: "left" | "right";
	bladeColor: string;
	bladeDark: string;
	rimColor: string;
}): React.JSX.Element {
	const gradId = `bat-rubber-${side}`;
	const woodId = `bat-wood-${side}`;
	const flip = side === "right" ? "translate(46 0) scale(-1 1)" : undefined;

	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 46 66"
			className="size-full overflow-visible"
		>
			<defs>
				<linearGradient id={gradId} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
					<stop offset="0%" stopColor={bladeColor} />
					<stop offset="100%" stopColor={bladeDark} />
				</linearGradient>
				<linearGradient id={woodId} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#b07542" />
					<stop offset="35%" stopColor="#e2ae74" />
					<stop offset="70%" stopColor="#c78a52" />
					<stop offset="100%" stopColor="#8c572b" />
				</linearGradient>
			</defs>
			<g transform={flip}>
				<g transform="rotate(28 23 33)">
					{/* Soft grounded tabletop vector shadow (zero CSS filter overhead) */}
					<path
						d="M23 3 C34.5 3 41 12 41 23.5 C41 33 35.8 39 29.5 41.5 C27.8 42.2 27 43.8 27.3 46 L29.2 60.5 C29.4 62.2 28.2 63.5 26.5 63.5 L19.5 63.5 C17.8 63.5 16.6 62.2 16.8 60.5 L18.7 46 C19 43.8 18.2 42.2 16.5 41.5 C10.2 39 5 33 5 23.5 C5 12 11.5 3 23 3 Z"
						transform="translate(2 5)"
						fill="rgba(0,0,0,0.34)"
					/>
					{/* Natural flared wooden handle + blade neck */}
					<path
						d="M23 3 C34.5 3 41 12 41 23.5 C41 33 35.8 39 29.5 41.5 C27.8 42.2 27 43.8 27.3 46 L29.2 60.5 C29.4 62.2 28.2 63.5 26.5 63.5 L19.5 63.5 C17.8 63.5 16.6 62.2 16.8 60.5 L18.7 46 C19 43.8 18.2 42.2 16.5 41.5 C10.2 39 5 33 5 23.5 C5 12 11.5 3 23 3 Z"
						fill={`url(#${woodId})`}
						stroke="#4f2d14"
						strokeWidth="1.2"
					/>
					{/* Laminated handle wood inlay stripes */}
					<path
						d="M21 43.5 L20.2 62.8 L22.2 62.8 L22.4 43.5 Z"
						fill="#6e3f1d"
						opacity="0.7"
					/>
					<path
						d="M23.6 43.5 L23.8 62.8 L25.8 62.8 L25 43.5 Z"
						fill="#f3cfa0"
						opacity="0.5"
					/>
					{/* Butt-cap badge */}
					<rect
						x="18.2"
						y="59.8"
						width="9.6"
						height="2.4"
						rx="0.8"
						fill="#171513"
					/>
					<rect
						x="21.4"
						y="60.4"
						width="3.2"
						height="1.2"
						rx="0.4"
						fill={bladeColor}
					/>
					{/* Precision bonded rubber sheet */}
					<path
						d="M23 4.6 C33.6 4.6 39.4 12.8 39.4 23.4 C39.4 31.6 34.8 36.8 29.6 38.6 L16.4 38.6 C11.2 36.8 6.6 31.6 6.6 23.4 C6.6 12.8 12.4 4.6 23 4.6 Z"
						fill={`url(#${gradId})`}
						stroke={rimColor}
						strokeWidth="1.15"
					/>
					<path
						d="M12.5 14.5 C15 9.5 20.5 7.2 26.8 8.2"
						fill="none"
						stroke="rgba(255,255,255,0.45)"
						strokeWidth="1.4"
						strokeLinecap="round"
					/>
					<line
						x1="16.5"
						y1="38.2"
						x2="29.5"
						y2="38.2"
						stroke="#171513"
						strokeWidth="1.8"
					/>
				</g>
			</g>
		</svg>
	);
}

/** Crisp 5-ray tactical hit spark vector flashing off the bat on ball contact. */
function ImpactSpark({ color }: { color: string }): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className="size-6 overflow-visible"
		>
			<g stroke={color} strokeWidth="2" strokeLinecap="round">
				<line x1="12" y1="2" x2="12" y2="7" />
				<line x1="19" y1="6" x2="15.5" y2="9.5" />
				<line x1="19" y1="18" x2="15.5" y2="14.5" />
				<line x1="5" y1="6" x2="8.5" y2="9.5" />
				<line x1="5" y1="18" x2="8.5" y2="14.5" />
			</g>
		</svg>
	);
}

/**
 * 60fps GPU-composited (`translate3d`) physics-driven ITTF top-down ping-pong table:
 * - Zero layout thrashing per frame & 100% C0-continuous height, bat motion, and trail across contact
 * - Randomized rally sets with speed-coupled pure dotted trajectory tails
 * - Synchronized tabletop bounce ripples & bat strike sparks
 */
function PingPongTable({
	rallyIndex,
	startOffsetMs,
}: {
	rallyIndex: number;
	startOffsetMs: number;
}): React.JSX.Element {
	const surfaceRef = useRef<HTMLDivElement>(null);
	const ballRef = useRef<HTMLDivElement>(null);
	const shadowRef = useRef<HTMLDivElement>(null);
	const leftBatRef = useRef<HTMLDivElement>(null);
	const rightBatRef = useRef<HTMLDivElement>(null);
	const bounceRef = useRef<HTMLSpanElement>(null);
	const sparkLRef = useRef<HTMLDivElement>(null);
	const sparkRRef = useRef<HTMLDivElement>(null);
	const trailDotsRef = useRef<(SVGCircleElement | null)[]>([]);

	useEffect(() => {
		if (import.meta.env.VITEST) return;

		const surface = surfaceRef.current;
		if (!surface) return;

		let width = surface.clientWidth || 384;
		let height = surface.clientHeight || 213;

		const ro =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(() => {
						width = surface.clientWidth || width;
						height = surface.clientHeight || height;
					})
				: null;
		ro?.observe(surface);

		const shots = RALLY_SETS[rallyIndex % RALLY_SETS.length];
		let rafId = 0;
		const t0 = performance.now();

		function renderAt(elapsedMs: number) {
			const nowMs = startOffsetMs + elapsedMs;
			const cur = sampleRally(shots, nowMs);
			const prevShot = shots[(cur.shotIndex - 1 + shots.length) % shots.length];

			const ballX = (cur.x / 100) * width;
			const ballY = (cur.y / 100) * height;

			// 1. GPU-composited Ball + height-synced tabletop shadow (zero z-jump at bat contact)
			if (ballRef.current) {
				const scale = 0.86 + cur.z * 0.4;
				ballRef.current.style.transform = `translate3d(${ballX.toFixed(2)}px, ${ballY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
			}
			if (shadowRef.current) {
				const dropY = 1.5 + cur.z * 14;
				const shScale = 1.06 - cur.z * 0.28;
				const shOpacity = Math.max(0.24, 0.76 - cur.z * 0.44);
				shadowRef.current.style.transform = `translate3d(${ballX.toFixed(2)}px, ${(ballY + dropY).toFixed(2)}px, 0) translate(-50%, -50%) scale(${shScale.toFixed(3)})`;
				shadowRef.current.style.opacity = shOpacity.toFixed(2);
			}

			// 2. Smooth velocity-coupled dotted trajectory tail (no 1-frame vanish on bat strike)
			for (let i = 0; i < TRAIL_DOT_COUNT; i++) {
				const dot = trailDotsRef.current[i];
				if (!dot) continue;
				const prev = sampleRally(shots, nowMs - (i + 1) * TRAIL_STEP_MS);
				const sameSide = prev.shot.from === cur.shot.from;
				const t = i / (TRAIL_DOT_COUNT - 1);
				const r = 2.3 - t * 1.5;
				const baseOpacity = 0.86 * (1 - t * 0.9);
				const opacity = sameSide ? baseOpacity : baseOpacity * 0.35;
				dot.setAttribute("cx", ((prev.x / 100) * 274).toFixed(1));
				dot.setAttribute("cy", ((prev.y / 100) * 152).toFixed(1));
				dot.setAttribute("r", r.toFixed(2));
				dot.setAttribute(
					"fill",
					prev.shot.from === "L" ? "#f5611f" : "#ffc978"
				);
				dot.setAttribute("fill-opacity", opacity.toFixed(2));
			}

			// 3. Synchronized tabletop bounce impact ripple right on table touch
			if (bounceRef.current) {
				if (cur.u >= BOUNCE_U) {
					const q = (cur.u - BOUNCE_U) / (1 - BOUNCE_U);
					const bx = (cur.shot.xBounce / 100) * width;
					const by = (cur.shot.yBounce / 100) * height;
					const ringScale = 0.35 + q * 2.15;
					const ringOpacity = Math.max(0, 1 - q * 1.15);
					bounceRef.current.style.borderColor =
						cur.shot.from === "L" ? "#f5611f" : "#ffc978";
					bounceRef.current.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0) translate(-50%, -50%) scale(${ringScale.toFixed(2)})`;
					bounceRef.current.style.opacity = ringOpacity.toFixed(2);
				} else {
					bounceRef.current.style.opacity = "0";
				}
			}

			// 4. 100% C0-continuous bat Y, backswing, strike whip & follow-through (zero jump at u=0 / u=1!)
			const smoothU = smoothstep(cur.u);
			const whip = cur.u < 0.3 ? Math.sin((cur.u / 0.3) * Math.PI) : 0;
			const windup =
				cur.u > 0.72 ? Math.sin(((cur.u - 0.72) / 0.28) * Math.PI) : 0;

			const leftY =
				cur.shot.from === "L"
					? lerp(cur.shot.yStart, restYFor(cur.shot.yStart), smoothU)
					: lerp(restYFor(prevShot.yStart), cur.shot.yEnd, smoothU);
			const rightY =
				cur.shot.from === "R"
					? lerp(cur.shot.yStart, restYFor(cur.shot.yStart), smoothU)
					: lerp(restYFor(prevShot.yStart), cur.shot.yEnd, smoothU);

			if (leftBatRef.current) {
				const lx =
					0.095 * width + (cur.shot.from === "L" ? whip * 8 : -windup * 4);
				const ly = (leftY / 100) * height;
				const lrot = cur.shot.from === "L" ? -whip * 20 : windup * 7;
				leftBatRef.current.style.transform = `translate3d(${lx.toFixed(2)}px, ${ly.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${lrot.toFixed(1)}deg)`;
			}
			if (rightBatRef.current) {
				const rx =
					0.905 * width + (cur.shot.from === "R" ? -whip * 8 : windup * 4);
				const ry = (rightY / 100) * height;
				const rrot = cur.shot.from === "R" ? whip * 20 : -windup * 7;
				rightBatRef.current.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${rrot.toFixed(1)}deg)`;
			}

			// 5. Paddle impact spark burst right on strike contact
			if (sparkLRef.current) {
				if (cur.shot.from === "L" && cur.u < 0.2) {
					const s = cur.u / 0.2;
					const sx = 0.13 * width;
					const sy = (cur.shot.yStart / 100) * height;
					sparkLRef.current.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.55 + s * 1.05).toFixed(2)})`;
					sparkLRef.current.style.opacity = (1 - s).toFixed(2);
				} else {
					sparkLRef.current.style.opacity = "0";
				}
			}
			if (sparkRRef.current) {
				if (cur.shot.from === "R" && cur.u < 0.2) {
					const s = cur.u / 0.2;
					const sx = 0.87 * width;
					const sy = (cur.shot.yStart / 100) * height;
					sparkRRef.current.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.55 + s * 1.05).toFixed(2)})`;
					sparkRRef.current.style.opacity = (1 - s).toFixed(2);
				} else {
					sparkRRef.current.style.opacity = "0";
				}
			}
		}

		renderAt(0);
		const tick = (now: number) => {
			renderAt(now - t0);
			rafId = window.requestAnimationFrame(tick);
		};
		rafId = window.requestAnimationFrame(tick);

		return () => {
			window.cancelAnimationFrame(rafId);
			ro?.disconnect();
		};
	}, [rallyIndex, startOffsetMs]);

	return (
		<div
			data-pong-court=""
			data-rally-set={rallyIndex}
			className="relative w-76 max-w-[82vw] shadow-[0_24px_40px_-14px_rgba(0,0,0,0.85)] sm:w-96"
		>
			{/* Protruding metal net clamp posts */}
			<span className="bg-ink-700 absolute -top-2.5 left-1/2 z-20 h-2.5 w-2 -translate-x-1/2 border border-white/30" />
			<span className="bg-ink-700 absolute -bottom-2.5 left-1/2 z-20 h-2.5 w-2 -translate-x-1/2 border border-white/30" />

			{/* Official 274:152 sharp 90° rectangular playing surface */}
			<div
				ref={surfaceRef}
				className="relative aspect-274/152 w-full overflow-hidden border-2 border-white/90 bg-[#1e2624]"
				style={{
					backgroundImage:
						"linear-gradient(135deg, rgb(255 255 255 / 0.05) 0%, transparent 45%, rgb(0 0 0 / 0.2) 100%)",
				}}
			>
				<div className="pointer-events-none absolute inset-1.5 border border-white/10" />

				{/* Official horizontal doubles center service line */}
				<div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/38" />

				{/* Pure dynamic dotted trajectory trail (spacing follows real ball speed) */}
				<svg
					aria-hidden="true"
					viewBox="0 0 274 152"
					preserveAspectRatio="none"
					className="pointer-events-none absolute inset-0 z-10 size-full"
				>
					{Array.from({ length: TRAIL_DOT_COUNT }, (_, idx) => (
						<circle
							key={idx}
							ref={(el) => {
								trailDotsRef.current[idx] = el;
							}}
							cx={0}
							cy={0}
							r={0}
							fill="#f5611f"
							fillOpacity={0}
						/>
					))}
				</svg>

				{/* Live tabletop bounce ripple ring (GPU translate3d) */}
				<span
					ref={bounceRef}
					aria-hidden="true"
					className="pointer-events-none absolute top-0 left-0 z-10 size-5 rounded-full border-2 opacity-0 will-change-transform"
				/>

				{/* Cast tabletop shadow of vertical net */}
				<div className="absolute inset-y-0 left-[calc(50%+2px)] w-3 bg-linear-to-r from-black/45 to-transparent" />

				{/* Real vertical ping-pong net mesh */}
				<div
					className="absolute inset-y-0 left-1/2 z-20 w-1.5 -translate-x-1/2 border-x border-white/80 bg-white/18"
					style={{
						backgroundImage:
							"repeating-linear-gradient(0deg, rgb(255 255 255 / 0.58) 0px, rgb(255 255 255 / 0.58) 1px, transparent 1px, transparent 4px)",
					}}
				/>

				{/* Left precision vector table-tennis racket + impact spark */}
				<div
					ref={leftBatRef}
					className="absolute top-0 left-0 z-20 h-14 w-10 will-change-transform"
				>
					<PingPongBat
						side="left"
						bladeColor="#f5611f"
						bladeDark="#b03608"
						rimColor="#ffd0b4"
					/>
				</div>
				<div
					ref={sparkLRef}
					className="pointer-events-none absolute top-0 left-0 z-30 opacity-0 will-change-transform"
				>
					<ImpactSpark color="#ffc978" />
				</div>

				{/* Right precision vector table-tennis racket + impact spark */}
				<div
					ref={rightBatRef}
					className="absolute top-0 left-0 z-20 h-14 w-10 will-change-transform"
				>
					<PingPongBat
						side="right"
						bladeColor="#ffc978"
						bladeDark="#d98a25"
						rimColor="#fff5e0"
					/>
				</div>
				<div
					ref={sparkRRef}
					className="pointer-events-none absolute top-0 left-0 z-30 opacity-0 will-change-transform"
				>
					<ImpactSpark color="#f5611f" />
				</div>

				{/* Arcing round ping-pong ball + height-synced tabletop shadow (GPU translate3d) */}
				<div
					ref={shadowRef}
					className="pointer-events-none absolute top-0 left-0 z-20 size-2.5 rounded-full bg-black/75 blur-[1px] will-change-transform"
				/>
				<div
					ref={ballRef}
					className="pointer-events-none absolute top-0 left-0 z-30 size-2.5 rounded-full border border-amber-300/70 will-change-transform"
					style={{
						backgroundImage:
							"radial-gradient(circle at 30% 28%, #ffffff 0%, #faf5ec 55%, #f4a43c 100%)",
					}}
				/>
			</div>

			{/* Physical 3D table apron / underside edge */}
			<div className="flex h-2 w-full items-center justify-between border-x-2 border-b-2 border-white/25 bg-[#0e0c0b] px-3">
				<span className="bg-brand h-0.5 w-8" />
				<span className="bg-brand h-0.5 w-8" />
			</div>
		</div>
	);
}

const ENTER_MS = 280;
const HOLD_MS = 640;
const EXIT_MS = 320;

/**
 * Global motion chrome:
 * 1. Top razor-thin scroll progress reading rail (`scaleX` GPU transform).
 * 2. True bottom-to-top `clip-path` shutter reveal (ZERO `scaleY` squash) with animated
 *    Valorant-inspired tactical background layers and a randomized, flicker-free GPU-composited
 *    ping-pong rally with speed-coupled dotted trajectory tails.
 */
export function RouteTransition(): React.JSX.Element {
	const { pathname, search } = useLocation();
	const navigate = useNavigate();
	const [phase, setPhase] = useState<Phase>("idle");
	const [channelLabel, setChannelLabel] = useState(() =>
		channelLabelFor(pathname)
	);
	const [rallySeed, setRallySeed] = useState({ index: 0, offsetMs: 140 });
	const lastRallyRef = useRef(-1);
	const timers = useRef<number[]>([]);
	const busyRef = useRef(false);

	const { scrollYProgress } = useScroll();
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 260,
		damping: 32,
		restDelta: 0.001,
	});

	useEffect(() => {
		return () => {
			for (const id of timers.current) window.clearTimeout(id);
		};
	}, []);

	useEffect(() => {
		if (import.meta.env.VITEST) return;

		function onDocumentClick(event: MouseEvent) {
			if (
				busyRef.current ||
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const target = event.target as HTMLElement | null;
			const anchor = target?.closest<HTMLAnchorElement>("a[href]");
			if (!anchor) return;
			if (anchor.target && anchor.target !== "_self") return;
			if (anchor.hasAttribute("download")) return;

			const rawHref = anchor.getAttribute("href");
			if (
				!rawHref ||
				rawHref.startsWith("#") ||
				rawHref.startsWith("mailto:") ||
				rawHref.startsWith("tel:")
			) {
				return;
			}

			let url: URL;
			try {
				url = new URL(anchor.href, window.location.origin);
			} catch {
				return;
			}
			if (url.origin !== window.location.origin) return;
			if (url.pathname === pathname) return;

			event.preventDefault();
			event.stopPropagation();

			busyRef.current = true;
			for (const id of timers.current) window.clearTimeout(id);
			timers.current = [];

			let nextIndex = Math.floor(Math.random() * RALLY_SETS.length);
			if (nextIndex === lastRallyRef.current) {
				nextIndex = (nextIndex + 1) % RALLY_SETS.length;
			}
			lastRallyRef.current = nextIndex;
			setRallySeed({
				index: nextIndex,
				offsetMs: Math.floor(Math.random() * 1400),
			});

			setChannelLabel(channelLabelFor(url.pathname));
			setPhase("entering");

			const dest = `${url.pathname}${url.search}${url.hash}`;
			const t1 = window.setTimeout(() => {
				void navigate(dest);
				window.scrollTo(0, 0);
				setPhase("holding");

				const t2 = window.setTimeout(() => {
					setPhase("exiting");
					const t3 = window.setTimeout(() => {
						setPhase("idle");
						busyRef.current = false;
					}, EXIT_MS);
					timers.current.push(t3);
				}, HOLD_MS);
				timers.current.push(t2);
			}, ENTER_MS);
			timers.current.push(t1);
		}

		document.addEventListener("click", onDocumentClick, true);
		return () => document.removeEventListener("click", onDocumentClick, true);
	}, [navigate, pathname, search]);

	const visible = phase !== "idle";
	const isExiting = phase === "exiting";
	const { brand, target: destination } = splitLabel(channelLabel);

	return (
		<>
			{/* Razor-thin scroll progress rail pinned cleanly above the fixed navbar */}
			<motion.div
				aria-hidden="true"
				data-scroll-progress=""
				style={{ scaleX: smoothProgress }}
				className="bg-brand pointer-events-none fixed inset-x-0 top-0 z-60 h-[2.5px] origin-left"
			/>

			{/* 3-Stage Clip-Path Shutter Reveal: renders cleanly from bottom up (ZERO scaleY squash!) */}
			{visible && (
				<div
					aria-hidden="true"
					data-route-curtain=""
					data-phase={phase}
					className="pointer-events-none fixed inset-0 z-150 overflow-hidden"
				>
					{/* Leading/trailing vermilion accent wipe edge */}
					<motion.div
						className="bg-brand absolute inset-0"
						initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
						animate={{
							clipPath: isExiting
								? "inset(0% 0% 100% 0%)"
								: "inset(0% 0% 0% 0%)",
						}}
						transition={{
							duration: isExiting ? 0.3 : 0.24,
							delay: isExiting ? 0.045 : 0,
							ease: [0.76, 0, 0.24, 1],
						}}
					/>

					{/* Tactical Valorant-inspired warm charcoal × vermilion canvas with animated graphic layers */}
					<motion.div
						className="bg-ink-900 absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
						initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
						animate={{
							clipPath: isExiting
								? "inset(0% 0% 100% 0%)"
								: "inset(0% 0% 0% 0%)",
						}}
						transition={{
							duration: isExiting ? 0.26 : 0.25,
							delay: isExiting ? 0 : 0.04,
							ease: [0.76, 0, 0.24, 1],
						}}
					>
						{/* 1. Living Valorant-style angled graphic shards, drifting type & marching stripes */}
						<div className="pointer-events-none absolute inset-0 overflow-hidden">
							<div
								className="bg-ink-800/80 absolute -inset-y-24 left-[-12%] w-[52%] -skew-x-18 border-r border-white/8"
								style={{
									backgroundImage:
										"repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.025) 0px, rgb(255 255 255 / 0.025) 1px, transparent 1px, transparent 14px)",
								}}
							/>
							<div className="animate-slash-glide bg-brand/90 absolute -top-24 left-[8%] h-[145%] w-2.5 sm:left-[12%] sm:w-3.5" />
							<div
								className="animate-slash-glide bg-brand/22 absolute -top-24 left-[calc(8%+20px)] h-[145%] w-12 sm:left-[calc(12%+24px)] sm:w-16"
								style={{ animationDelay: "-1.1s" }}
							/>

							<div className="bg-ink-800/55 absolute -inset-y-24 right-[-14%] w-[36%] -skew-x-18 border-l border-white/10" />
							<div
								className="animate-slash-glide absolute right-[14%] -bottom-16 h-[78%] w-1 bg-amber-300/50"
								style={{ animationDelay: "-1.8s" }}
							/>

							{/* Seamless vector scrolling diagonal hazard stripes (zero tile seams) */}
							<div className="absolute top-12 right-12 hidden h-3 w-36 overflow-hidden opacity-55 sm:block">
								<div className="animate-hazard-scroll -ml-4 flex h-full w-[calc(100%+48px)] gap-2 will-change-transform">
									{Array.from({ length: 16 }, (_, idx) => (
										<span
											key={idx}
											className="bg-brand block h-full w-2 shrink-0 -skew-x-35"
										/>
									))}
								</div>
							</div>
							<div className="absolute bottom-12 left-12 hidden h-3 w-40 overflow-hidden opacity-40 sm:block">
								<div
									className="animate-hazard-scroll -ml-4 flex h-full w-[calc(100%+48px)] gap-2 will-change-transform"
									style={{ animationDirection: "reverse" }}
								>
									{Array.from({ length: 18 }, (_, idx) => (
										<span
											key={idx}
											className="bg-cream block h-full w-2 shrink-0 -skew-x-35"
										/>
									))}
								</div>
							</div>

							<div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden select-none">
								<span
									className="animate-banner-drift-l font-display text-[21vw] leading-[0.82] font-extrabold tracking-[-0.04em] uppercase"
									style={{
										color: "transparent",
										WebkitTextStroke: "1.5px rgb(255 255 255 / 0.075)",
									}}
								>
									ONTABLE
								</span>
								<span className="animate-banner-drift-r font-display -mt-4 text-[17vw] leading-[0.82] font-extrabold tracking-[-0.04em] text-white/4.5 uppercase">
									STUDIO
								</span>
							</div>

							<div className="absolute inset-5 overflow-hidden border border-white/10 sm:inset-8">
								<span className="border-brand absolute -top-px -left-px size-4 border-t-2 border-l-2" />
								<span className="border-brand absolute -top-px -right-px size-4 border-t-2 border-r-2" />
								<span className="border-brand absolute -bottom-px -left-px size-4 border-b-2 border-l-2" />
								<span className="border-brand absolute -right-px -bottom-px size-4 border-r-2 border-b-2" />

								<div className="animate-tactical-scan absolute inset-x-0 h-px bg-linear-to-r from-transparent via-amber-300/35 to-transparent" />

								<div className="text-caption text-ink-300 absolute top-3.5 left-4 flex items-center gap-2 font-mono tracking-[0.16em] uppercase">
									<span className="bg-brand inline-block size-2 rotate-45 animate-pulse" />
									ONTABLE STUDIO // IDN
								</div>

								<div className="text-caption text-ink-400 absolute right-4 bottom-3.5 hidden items-center gap-3 font-mono tracking-[0.14em] uppercase sm:flex">
									<span>FROM OUR TABLE TO YOURS</span>
									<span className="inline-block size-1.5 rotate-45 bg-amber-300/70" />
								</div>
							</div>

							<div className="absolute inset-y-8 left-[18%] hidden w-px bg-white/6 lg:block">
								<span className="animate-reticle-float bg-brand/80 absolute top-[28%] -left-1 size-2 rotate-45" />
								<span
									className="animate-reticle-float absolute top-[68%] -left-1.5 size-3 rotate-45 border border-white/30"
									style={{ animationDelay: "-1.3s" }}
								/>
							</div>
							<div className="absolute inset-y-8 right-[18%] hidden w-px bg-white/6 lg:block">
								<span
									className="animate-reticle-float absolute top-[34%] -left-1.5 size-3 rotate-45 border border-amber-300/40"
									style={{ animationDelay: "-0.7s" }}
								/>
								<span
									className="animate-reticle-float bg-cream/60 absolute top-[72%] -left-1 size-2 rotate-45"
									style={{ animationDelay: "-1.9s" }}
								/>
							</div>
						</div>

						{/* Whisper-subtle CRT scanlines */}
						<div className="crt-scanlines absolute inset-0 opacity-18" />

						{/* 2. Foreground Center Stage — rock-solid 1:1 in center */}
						<div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 text-center">
							<div className="mb-2 flex items-center gap-2.5 font-mono text-xs font-medium tracking-[0.22em] text-amber-300 uppercase">
								<span className="bg-brand h-0.5 w-6" />
								<span>{brand}</span>
								<span className="bg-brand h-0.5 w-6" />
							</div>

							<h2 className="font-display text-h2 sm:text-h1 text-cream leading-[0.98] font-extrabold tracking-[-0.03em] uppercase">
								{destination}
							</h2>

							<div className="mt-5 flex w-64 items-center gap-2 sm:w-80">
								<span className="bg-brand size-1.5 shrink-0 rotate-45" />
								<div className="bg-ink-800 relative h-1.5 flex-1 overflow-hidden border border-white/15">
									<motion.div
										className="bg-brand h-full origin-left"
										initial={{ scaleX: 0 }}
										animate={{ scaleX: isExiting ? 1 : 0.94 }}
										transition={{
											duration: (ENTER_MS + HOLD_MS) / 1000,
											ease: [0.22, 1, 0.36, 1],
										}}
									/>
								</div>
								<span className="size-1.5 shrink-0 rotate-45 bg-amber-300" />
							</div>

							{/* 3. Randomized 60fps GPU-composited Ping-Pong Table */}
							<div className="relative mt-8 flex flex-col items-center">
								<PingPongTable
									rallyIndex={rallySeed.index}
									startOffsetMs={rallySeed.offsetMs}
								/>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</>
	);
}
