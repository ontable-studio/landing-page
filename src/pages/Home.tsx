import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Footer } from "../components/layout/Footer";
import { useContact } from "../components/layout/Contact";
import { Nav } from "../components/layout/Nav";
import { RouterLink } from "../components/layout/RouterLink";
import { SectionFrame } from "../components/layout/SectionFrame";
import { SectionHeader } from "../components/layout/SectionHeader";
import { SkipLink } from "../components/layout/SkipLink";
import { Accordion, type AccordionItem } from "../components/ui/Accordion";
import { Badge } from "../components/ui/Badge";
import { buttonVariants } from "../components/ui/Button";
import { CrtScreen, type GlitchLevel } from "../components/ui/CrtScreen";
import { Marquee, type MarqueeEntry } from "../components/ui/Marquee";
import { ProjectCard } from "../components/ui/ProjectCard";
import { Reveal } from "../components/ui/Reveal";
import { localizedProjects } from "../data/localize";
import { headlineLines, tagline, useT } from "../i18n";
import { cn } from "../lib/cn";
import { useSeo } from "../seo/useSeo";

const DECK_INTERVAL_MS = 5200;
const CRAFT_INTERVAL_MS = 4600;
const PEEL_MS = 250;
const TUCK_MS = 320;

const STACK_SLOTS = [
	{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: 40, opacity: 1 },
	{ x: 9, y: 10, rotate: 2.2, scale: 0.96, zIndex: 30, opacity: 0.94 },
	{ x: -7, y: 19, rotate: -2, scale: 0.92, zIndex: 20, opacity: 0.84 },
	{ x: 5, y: 26, rotate: 1.3, scale: 0.88, zIndex: 10, opacity: 0.72 },
	{ x: -3, y: 31, rotate: -1, scale: 0.85, zIndex: 6, opacity: 0.58 },
] as const;

/** Depth-leveled ambient shadows: top card floats with wide, thin, subtle blur; lower cards ground softly without hard offsets. */
const STACK_SLOT_SHADOWS = [
	"border-ink-900/14 shadow-[0_22px_44px_-16px_rgba(23,21,19,0.12),0_6px_16px_-8px_rgba(23,21,19,0.06)]",
	"border-ink-900/12 shadow-[0_14px_26px_-12px_rgba(23,21,19,0.10),0_3px_10px_-4px_rgba(23,21,19,0.05)]",
	"border-ink-900/10 shadow-[0_8px_16px_-8px_rgba(23,21,19,0.08)]",
	"border-ink-900/8 shadow-[0_4px_10px_-5px_rgba(23,21,19,0.06)]",
	"border-ink-900/8 shadow-[0_2px_6px_-3px_rgba(23,21,19,0.04)]",
] as const;

type ShuffleState = {
	card: number;
	stage: "peel" | "tuck";
} | null;

function ArrowUpRight({
	className,
}: {
	className?: string;
}): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			className={cn(
				"size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5",
				className
			)}
		>
			<path d="M4 12 12 4M5.5 4H12v6.5" />
		</svg>
	);
}

function MiniChevron({ dir }: { dir: "left" | "right" }): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-3.5"
		>
			<path
				d={dir === "left" ? "M10 3.5 5.5 8 10 12.5" : "M6 3.5 10.5 8 6 12.5"}
			/>
		</svg>
	);
}

/**
 * The home page:
 * 1. Full 100svh Hero inside continuous architectural rails (Nav -> Masthead -> Hero -> Index Rail -> Marquee)
 * 2. Toasted Cream Selected Works
 * 3. Deep CRT Charcoal Studio Craft (escalating bzt... bzt... -> burst auto-cycle TV)
 * 4. Warm Sandstone Studio FAQ (Ivory Accordion cards)
 * 5. Bold Vermilion Collaboration Poster & Continuous-Rail Parchment Footer
 */
export default function Home(): React.JSX.Element {
	useSeo({ name: "home" });
	const { open: openContact } = useContact();
	const { locale, t, to } = useT();
	const lines = headlineLines(locale);
	const projects = localizedProjects(locale);
	const count = projects.length;

	// Card stack order: deckOrder[0] is always the active front card.
	const [deckOrder, setDeckOrder] = useState<number[]>(() =>
		projects.map((_, idx) => idx)
	);
	const [shuffleState, setShuffleState] = useState<ShuffleState>(null);
	const [deckGlitch, setDeckGlitch] = useState<GlitchLevel>("idle");
	const [deckPaused, setDeckPaused] = useState(false);

	// Studio Craft auto-cycling CRT monitor state:
	// Auto-advance continues across the section, pausing ONLY when hovering/focusing
	// the active option or the CRT preview card itself.
	const [activeCraftIndex, setActiveCraftIndex] = useState(0);
	const [craftGlitch, setCraftGlitch] = useState<GlitchLevel>("idle");
	const [craftCardHovered, setCraftCardHovered] = useState(false);
	const [craftHoveredIdx, setCraftHoveredIdx] = useState<number | null>(null);
	const craftPaused = craftCardHovered || craftHoveredIdx === activeCraftIndex;

	const shuffleTimers = useRef<number[]>([]);
	const busyShuffle = useRef(false);

	const activeDeckIndex = deckOrder[0] ?? 0;
	const [featured, ...restProjects] = projects;

	useEffect(() => {
		return () => {
			for (const id of shuffleTimers.current) window.clearTimeout(id);
		};
	}, []);

	/**
	 * True 2-beat physical shuffle:
	 * Beat 1 ("peel"): top card peels cleanly out to the right while the stack underneath waits.
	 * Beat 2 ("tuck"): order updates so the peeled card drops behind the stack and tucks to back
	 * while the next card springs cleanly up to front.
	 */
	function runTwoBeatShuffle(
		// eslint-disable-next-line no-unused-vars -- base rule misreads parameter names in type signatures
		computeNext: (current: number[]) => {
			nextOrder: number[];
			outgoing: number;
		}
	) {
		if (count < 2 || busyShuffle.current) return;

		if (import.meta.env.VITEST) {
			setDeckOrder((current) => computeNext(current).nextOrder);
			return;
		}

		busyShuffle.current = true;
		for (const id of shuffleTimers.current) window.clearTimeout(id);
		shuffleTimers.current = [];

		const { nextOrder, outgoing } = computeNext(deckOrder);
		setDeckGlitch("burst");
		setShuffleState({ card: outgoing, stage: "peel" });

		const t1 = window.setTimeout(() => {
			setDeckOrder(nextOrder);
			setDeckGlitch("bzt");
			setShuffleState({ card: outgoing, stage: "tuck" });

			const t2 = window.setTimeout(() => {
				setShuffleState(null);
				setDeckGlitch("idle");
				busyShuffle.current = false;
			}, TUCK_MS);
			shuffleTimers.current.push(t2);
		}, PEEL_MS);
		shuffleTimers.current.push(t1);
	}

	function stepNext() {
		runTwoBeatShuffle((current) => {
			const [top, ...rest] = current;
			return { nextOrder: [...rest, top], outgoing: top };
		});
	}

	function stepPrev() {
		runTwoBeatShuffle((current) => {
			const top = current[0];
			const last = current[current.length - 1];
			const middle = current.slice(1, -1);
			return { nextOrder: [last, ...middle, top], outgoing: top };
		});
	}

	function selectDeck(targetIndex: number) {
		if (targetIndex === activeDeckIndex) return;
		runTwoBeatShuffle((current) => {
			const top = current[0];
			const remaining = current.filter(
				(idx) => idx !== targetIndex && idx !== top
			);
			return { nextOrder: [targetIndex, ...remaining, top], outgoing: top };
		});
	}

	// Escalating idle -> bzt -> surge -> burst -> auto-shuffle on Hero Deck (cleanly rewinds when hovered).
	useEffect(() => {
		if (import.meta.env.VITEST || count < 2) return;
		if (deckPaused) {
			setDeckGlitch("idle");
			return;
		}
		setDeckGlitch("idle");
		const t1 = window.setTimeout(() => setDeckGlitch("bzt"), 2600);
		const t2 = window.setTimeout(() => setDeckGlitch("idle"), 2980);
		const t3 = window.setTimeout(() => setDeckGlitch("surge"), 3950);
		const t4 = window.setTimeout(() => setDeckGlitch("burst"), 4750);
		const t5 = window.setTimeout(() => {
			runTwoBeatShuffle((current) => {
				const [top, ...rest] = current;
				return { nextOrder: [...rest, top], outgoing: top };
			});
		}, DECK_INTERVAL_MS);

		return () => {
			window.clearTimeout(t1);
			window.clearTimeout(t2);
			window.clearTimeout(t3);
			window.clearTimeout(t4);
			window.clearTimeout(t5);
		};
	}, [activeDeckIndex, deckPaused, count]);

	// Escalating idle -> bzt... bzt... -> burst -> next channel on Studio Craft TV (smooth rewind on hover).
	useEffect(() => {
		if (import.meta.env.VITEST) return;
		if (craftPaused) {
			setCraftGlitch("idle");
			return;
		}
		setCraftGlitch("idle");
		const t1 = window.setTimeout(() => setCraftGlitch("bzt"), 2100);
		const t2 = window.setTimeout(() => setCraftGlitch("idle"), 2520);
		const t3 = window.setTimeout(() => setCraftGlitch("surge"), 3400);
		const t4 = window.setTimeout(() => setCraftGlitch("burst"), 4180);
		const t5 = window.setTimeout(() => {
			setActiveCraftIndex((prev) => (prev + 1) % 4);
		}, CRAFT_INTERVAL_MS);

		return () => {
			window.clearTimeout(t1);
			window.clearTimeout(t2);
			window.clearTimeout(t3);
			window.clearTimeout(t4);
			window.clearTimeout(t5);
		};
	}, [activeCraftIndex, craftPaused]);

	// Longer lines (Indonesian) scale gently so each line stays crisp inside its rise mask.
	const fit = Math.min(1, 16 / Math.max(...lines.map((line) => line.length)));

	const bySlug = (slug: string) =>
		projects.find((project) => project.slug === slug) ?? projects[0];

	const marqueeItems: MarqueeEntry[] = [
		...projects.map((project) => ({
			label: project.title,
			meta: project.category,
		})),
		{ label: "OnTable Studio", meta: tagline(locale) },
	];

	const craftItems = [
		{
			id: "design",
			num: "01",
			title: t("home.craft1Title"),
			description: t("home.craft1Desc"),
			project: bySlug("craftboard-heroes"),
			image: "/images/projects/craftboard-heroes/04-quick-draw-popup.webp",
			caption:
				bySlug("craftboard-heroes").gallery[2]?.alt ?? "Craftboard Heroes",
		},
		{
			id: "systems",
			num: "02",
			title: t("home.craft2Title"),
			description: t("home.craft2Desc"),
			project: bySlug("oxshiftgen"),
			image: "/images/projects/oxshiftgen/02-carrying-canister.webp",
			caption: bySlug("oxshiftgen").gallery[0]?.alt ?? "OxShiftGen",
		},
		{
			id: "art",
			num: "03",
			title: t("home.craft3Title"),
			description: t("home.craft3Desc"),
			project: bySlug("ketik-mancing"),
			image: "/images/projects/ketik-mancing/03-village-bridge.webp",
			caption: bySlug("ketik-mancing").gallery[1]?.alt ?? "Ketik Mancing",
		},
		{
			id: "jams",
			num: "04",
			title: t("home.craft4Title"),
			description: t("home.craft4Desc"),
			project: bySlug("laundry-kita"),
			image: "/images/projects/laundry-kita/04-shop-layout.webp",
			caption: bySlug("laundry-kita").gallery[2]?.alt ?? "Laundry Kita",
		},
	];
	const activeCraft = craftItems[activeCraftIndex] ?? craftItems[0];

	const faqItems: AccordionItem[] = [
		{ id: "play", question: t("home.faq1Q"), answer: t("home.faq1A") },
		{ id: "platforms", question: t("home.faq2Q"), answer: t("home.faq2A") },
		{
			id: "ketik-mancing",
			question: t("home.faq3Q"),
			answer: t("home.faq3A"),
		},
		{ id: "collab", question: t("home.faq4Q"), answer: t("home.faq4A") },
		{ id: "jams", question: t("home.faq5Q"), answer: t("home.faq5A") },
	];

	return (
		<div className="bg-cream min-h-svh">
			<SkipLink />
			<Nav variant="overlay" />

			{/* 1. Full 100svh Architectural Hero (Masthead + Hero Stage + Index Rail + Marquee) */}
			<header
				data-hero-home=""
				className="bg-parchment relative flex flex-col overflow-x-clip pt-16 lg:min-h-svh lg:pt-18"
			>
				{/* Top Masthead */}
				<SectionFrame
					surfaceClass="bg-sandstone/45"
					outerClassName="border-ink-900/15 border-b"
					innerClassName="px-4 py-2 sm:px-6 lg:px-8"
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-caption text-brand-ink inline-flex items-center gap-2 font-mono font-medium tracking-[0.08em] uppercase">
							<span aria-hidden="true" className="bg-brand size-2 rounded-xs" />
							{t("home.eyebrow")}
						</p>
						<p className="text-caption text-ink-600 font-mono tracking-[0.06em] uppercase tabular-nums">
							{t("home.mastheadRight")}
						</p>
					</div>
				</SectionFrame>

				{/* Main Hero Canvas with pixel-centered top diamonds */}
				<SectionFrame
					surfaceClass="bg-parchment"
					outerClassName="flex flex-1 flex-col"
					innerClassName="flex flex-1 items-center px-4 py-7 sm:px-6 lg:px-8 lg:py-8"
					marksTop
				>
					<div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-10">
						{/* Left Column: Editorial Headline + CTAs + Hardware Tags */}
						<div className="lg:col-span-6 xl:col-span-7">
							<h1
								aria-label={tagline(locale)}
								style={{ "--fit": fit } as React.CSSProperties}
								className="font-display text-text-primary text-[calc(clamp(2.4rem,8.8vw,3.4rem)*var(--fit))] leading-[1.04] font-bold tracking-[-0.03em] lg:text-[calc(clamp(3.4rem,5.6vw,5.25rem)*var(--fit))] lg:leading-[0.98]"
							>
								{lines.map((line, index) => (
									<span
										key={line}
										className="mb-[-0.2em] block overflow-hidden pb-[0.2em]"
									>
										<span
											data-line=""
											className="animate-line-rise block"
											style={{ animationDelay: `${index * 80}ms` }}
										>
											{line}
										</span>
									</span>
								))}
							</h1>

							<p className="text-body-lg text-ink-600 mt-5 max-w-lg">
								{t("home.description")}
							</p>

							<div className="mt-7 flex flex-wrap items-center gap-3">
								<Link
									to={to("/projects")}
									className={cn(
										buttonVariants({ variant: "primary", size: "lg" })
									)}
								>
									{t("home.viewProjects")}
									<ArrowUpRight />
								</Link>
								<button
									type="button"
									onClick={openContact}
									className={cn(
										buttonVariants({ variant: "outline", size: "lg" })
									)}
								>
									{t("home.contact")}
								</button>
							</div>

							<div className="mt-7 hidden flex-wrap items-center gap-2 sm:flex">
								<span className="bg-ink-900 text-caption inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono font-medium text-amber-300">
									<span
										aria-hidden="true"
										className="bg-brand size-1.5 rounded-full"
									/>
									WEBGL &amp; DESKTOP
								</span>
								<span className="border-ink-300 bg-cream text-ink-700 text-caption rounded-full border px-3 py-1 font-mono">
									{projects.map((p) => p.category).join(" · ")}
								</span>
							</div>
						</div>

						{/* Right Column: True 2-Beat Physical 4-Card Shuffle Deck + Escalating CRT Glitch */}
						<div
							data-tabletop-deck=""
							className="lg:col-span-6 xl:col-span-5"
							onMouseEnter={() => setDeckPaused(true)}
							onMouseLeave={() => setDeckPaused(false)}
							onFocusCapture={() => setDeckPaused(true)}
							onBlurCapture={(event) => {
								if (
									!event.currentTarget.contains(
										event.relatedTarget as Node | null
									)
								) {
									setDeckPaused(false);
								}
							}}
						>
							{/* Top Console Header & Shuffle Controls */}
							<div className="bg-ink-900 mb-2.5 flex items-center justify-between gap-2 rounded-2xl px-4 py-2 text-white shadow-[3px_3px_0_0_rgba(23,21,19,0.2)]">
								<span className="text-caption inline-flex items-center gap-2 font-mono font-medium tracking-[0.08em] text-amber-300 uppercase">
									<span
										aria-hidden="true"
										className="bg-brand size-2 rounded-full"
									/>
									{t("home.deckLabel")}
								</span>
								<div className="flex items-center gap-1.5">
									<span
										aria-live="polite"
										className="text-caption text-ink-300 mr-1.5 font-mono tabular-nums"
									>
										{String(activeDeckIndex + 1).padStart(2, "0")} /{" "}
										{String(count).padStart(2, "0")}
									</span>
									<button
										type="button"
										aria-label={t("home.deckPrev")}
										onClick={stepPrev}
										className="focus-visible:outline-brand grid size-7 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-1 active:scale-95"
									>
										<MiniChevron dir="left" />
									</button>
									<button
										type="button"
										aria-label={t("home.deckNext")}
										onClick={stepNext}
										className="focus-visible:outline-brand grid size-7 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-1 active:scale-95"
									>
										<MiniChevron dir="right" />
									</button>
								</div>
							</div>

							{/* True 4-Layer Physical Card Stack Stage (2-Beat Peel -> Tuck) */}
							<div className="relative mb-8 h-84 sm:h-88">
								{projects.map((project, projectIndex) => {
									const slot = deckOrder.indexOf(projectIndex);
									const isFront = slot === 0;
									const isPeeling =
										shuffleState?.card === projectIndex &&
										shuffleState.stage === "peel";
									const isTucking =
										shuffleState?.card === projectIndex &&
										shuffleState.stage === "tuck";
									const target =
										STACK_SLOTS[Math.min(slot, STACK_SLOTS.length - 1)];

									const animatePose = isPeeling
										? {
												x: 165,
												y: -22,
												rotate: 10.5,
												scale: 0.96,
												zIndex: 55,
												opacity: 0.98,
											}
										: isTucking
											? {
													x: target.x,
													y: target.y,
													rotate: target.rotate,
													scale: target.scale,
													zIndex: 5,
													opacity: target.opacity,
												}
											: {
													x: target.x,
													y: target.y,
													rotate: target.rotate,
													scale: target.scale,
													zIndex: target.zIndex,
													opacity: target.opacity,
												};

									return (
										<motion.div
											key={project.slug}
											data-stack-card=""
											data-slot={slot}
											aria-hidden={!isFront || undefined}
											initial={false}
											animate={animatePose}
											transition={
												isPeeling
													? {
															duration: PEEL_MS / 1000,
															ease: [0.32, 0, 0.2, 1],
														}
													: isTucking
														? {
																duration: TUCK_MS / 1000,
																ease: [0.22, 1, 0.36, 1],
															}
														: {
																type: "spring",
																stiffness: 300,
																damping: 27,
															}
											}
											className={cn(
												"bg-cream absolute inset-0 overflow-hidden rounded-3xl border p-2.5 transition-shadow duration-300",
												STACK_SLOT_SHADOWS[
													Math.min(slot, STACK_SLOT_SHADOWS.length - 1)
												],
												isFront ? "pointer-events-auto" : "pointer-events-none"
											)}
										>
											{/* Always-mounted progress bar that smoothly rewinds to 0 on hover */}
											{isFront && (
												<div
													aria-hidden="true"
													className="bg-ink-200/70 absolute inset-x-0 top-0 h-1 overflow-hidden"
												>
													<motion.div
														key={`deck-prog-${activeDeckIndex}`}
														className="bg-brand h-full origin-left"
														initial={{ scaleX: 0 }}
														animate={{ scaleX: deckPaused ? 0 : 1 }}
														transition={
															deckPaused
																? {
																		duration: 0.35,
																		ease: [0.22, 1, 0.36, 1],
																	}
																: {
																		duration: DECK_INTERVAL_MS / 1000,
																		ease: "linear",
																	}
														}
													/>
												</div>
											)}

											{/* Corner Year / WIP Notch */}
											{project.year !== undefined ? (
												<span className="text-caption text-ink-700 absolute top-3.5 right-4 z-10 font-mono font-medium tabular-nums">
													{project.year}
												</span>
											) : project.status ? (
												<span
													aria-hidden="true"
													className="text-label text-brand-ink absolute top-3.5 right-4 z-10 inline-flex items-center gap-1 font-mono font-medium uppercase"
												>
													<span className="bg-brand-ink size-1.5 rounded-full" />
													{t("card.inProgressShort")}
												</span>
											) : null}

											<Link
												to={to(`/projects/${project.slug}`)}
												tabIndex={isFront ? 0 : -1}
												className="focus-visible:outline-brand group flex h-full flex-col justify-between rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
											>
												{/* Authentic CRT Screen with escalating bzt -> surge -> burst glitch */}
												<div className="cut-corner bg-ink-900 relative aspect-16/10 overflow-hidden rounded-2xl border border-black/25">
													{project.image && (
														<CrtScreen
															src={project.image}
															alt={project.title}
															glitchLevel={isFront ? deckGlitch : "idle"}
															fetchPriority={isFront ? "high" : "auto"}
															loading="eager"
															className="size-full"
															imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
														>
															<span
																aria-hidden="true"
																className="bg-ink-900/85 text-caption absolute bottom-2 left-2.5 z-10 rounded-md border border-white/15 px-2 py-0.5 font-mono text-amber-300 tabular-nums"
															>
																{String(projectIndex + 1).padStart(2, "0")}
															</span>
														</CrtScreen>
													)}
												</div>

												<div className="flex items-start justify-between gap-3 px-2 pt-2.5 pb-1">
													<div className="min-w-0">
														{isFront ? (
															<h2 className="font-display text-title text-text-primary group-hover:text-brand-ink truncate font-bold transition-colors">
																{project.title}
															</h2>
														) : (
															<p className="font-display text-title text-text-primary truncate font-bold">
																{project.title}
															</p>
														)}
														<p className="text-body-sm text-text-secondary mt-0.5 line-clamp-2">
															{project.summary}
														</p>
														<div className="mt-2 flex flex-wrap items-center gap-2">
															<Badge variant="outline">
																{project.category}
															</Badge>
															{project.status && (
																<Badge variant="brand" className="bg-brand-ink">
																	{project.status}
																</Badge>
															)}
														</div>
													</div>
													<span
														aria-hidden="true"
														className="border-ink-300 bg-parchment text-ink-800 group-hover:border-ink-900 group-hover:bg-ink-900 mt-1 grid size-8.5 shrink-0 place-items-center rounded-full border transition-colors group-hover:text-white"
													>
														<ArrowUpRight />
													</span>
												</div>
											</Link>
										</motion.div>
									);
								})}
							</div>

							{/* Click-to-shuffle thumbnail selector strip */}
							<div
								role="group"
								aria-label={t("home.deckLabel")}
								className="bg-cream border-ink-300/80 grid grid-cols-5 gap-1.5 rounded-2xl border p-1.5 shadow-[0_3px_0_0_rgba(23,21,19,0.08)] sm:gap-2"
							>
								{projects.map((project, idx) => {
									const selected = idx === activeDeckIndex;
									return (
										<button
											key={project.slug}
											type="button"
											aria-pressed={selected}
											aria-label={project.title}
											onClick={() => selectDeck(idx)}
											className={cn(
												"focus-visible:outline-brand relative cursor-pointer overflow-hidden rounded-xl border p-0.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95",
												selected
													? "border-brand bg-parchment ring-brand/30 ring-2"
													: "border-ink-200 bg-parchment/60 opacity-75 hover:opacity-100"
											)}
										>
											{project.image && (
												<img
													src={project.image}
													alt=""
													aria-hidden="true"
													loading="eager"
													className="aspect-16/10 w-full rounded-[9px] object-cover"
												/>
											)}
											<span className="sr-only">{project.title}</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</SectionFrame>

				{/* Bottom Index Rail (top light diamonds + bottom dark diamonds on Marquee edge) */}
				<SectionFrame
					surfaceClass="bg-sandstone/50"
					outerClassName="z-10 border-ink-900/15 border-t"
					innerClassName="p-0"
					marksTop
					marksBottom
					marksBottomDark
				>
					<ul className="divide-ink-900/12 grid grid-cols-2 divide-y sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
						{projects.map((project, idx) => (
							<li key={project.slug}>
								<Link
									to={to(`/projects/${project.slug}`)}
									className="focus-visible:outline-brand hover:bg-cream/90 group flex items-baseline justify-between gap-2 px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-5"
								>
									<span className="flex min-w-0 items-baseline">
										<span className="text-caption text-brand-ink mr-2 shrink-0 font-mono font-medium tabular-nums">
											{String(idx + 1).padStart(2, "0")}
										</span>
										<span className="text-body-sm text-text-primary group-hover:text-brand-ink truncate font-semibold transition-colors">
											{project.title}
										</span>
									</span>
									<span className="text-caption text-ink-500 hidden shrink-0 font-mono uppercase xl:inline">
										{project.category}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</SectionFrame>

				{/* Kinetic Dark-Ink Marquee Ribbon anchored cleanly inside 100svh */}
				<Marquee items={marqueeItems} />
			</header>

			<main id="main-content" tabIndex={-1} className="focus:outline-none">
				{/* 2. Selected Works — Warm Toasted Cream (light top diamonds on Marquee bottom seam) */}
				<section className="border-ink-900/15 border-b">
					<SectionFrame
						surfaceClass="bg-cream"
						innerClassName="px-4 py-16 sm:px-6 lg:px-8 lg:py-22"
						marksTop
					>
						<Reveal>
							<SectionHeader
								eyebrow={t("home.selectedEyebrow")}
								title={t("home.selectedTitle")}
								action={
									<Link
										to={to("/projects")}
										className={cn(
											buttonVariants({ variant: "outline", size: "md" })
										)}
									>
										{t("home.selectedAll")}
										<ArrowUpRight />
									</Link>
								}
							/>
							<div
								aria-hidden="true"
								className="retro-stripes mt-6 h-2 w-full rounded-full opacity-65"
							/>
						</Reveal>

						{featured && (
							<Reveal delay={0.08} className="mt-8">
								<Link
									to={to(`/projects/${featured.slug}`)}
									className="group border-ink-300/85 bg-parchment hover:border-ink-900/40 focus-visible:outline-brand grid items-center gap-6 rounded-3xl border p-3 shadow-[0_4px_0_0_rgba(23,21,19,0.1)] transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_rgba(23,21,19,0.22),5px_5px_0_0_rgba(23,21,19,0.16)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 lg:grid-cols-12 lg:gap-8 lg:p-4"
								>
									<div className="relative lg:col-span-7">
										{featured.year !== undefined && (
											<span className="text-body-sm text-ink-600 group-hover:text-brand-ink absolute top-2.5 right-4 z-10 font-mono font-medium tabular-nums transition-colors">
												{featured.year}
											</span>
										)}
										<div className="cut-corner bg-ink-900 relative aspect-16/10 overflow-hidden rounded-2xl">
											{featured.image && (
												<img
													src={featured.image}
													alt={featured.title}
													loading="lazy"
													decoding="async"
													className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
												/>
											)}
											<div
												aria-hidden="true"
												className="crt-scanlines pointer-events-none absolute inset-0 opacity-14"
											/>
										</div>
									</div>

									<div className="flex flex-col justify-between gap-5 px-2 pb-2 lg:col-span-5 lg:px-2 lg:py-4">
										<div>
											<div className="flex flex-wrap items-center gap-2">
												<span className="bg-ink-900 text-caption rounded-md px-2 py-0.5 font-mono text-amber-300 tabular-nums">
													01
												</span>
												<Badge variant="outline">{featured.category}</Badge>
												{featured.status && (
													<Badge variant="brand" className="bg-brand-ink">
														{featured.status}
													</Badge>
												)}
											</div>
											<h3 className="font-display text-h3 text-text-primary group-hover:text-brand-ink mt-3 transition-colors">
												{featured.title}
											</h3>
											<p className="text-body text-text-secondary mt-3">
												{featured.summary}
											</p>
										</div>

										<div className="border-ink-300/80 flex items-center justify-between border-t pt-4">
											<span className="text-body-sm text-text-primary font-semibold">
												{t("home.deckOpen")}
											</span>
											<span
												aria-hidden="true"
												className="border-ink-300 bg-cream text-ink-800 group-hover:border-ink-900 group-hover:bg-ink-900 grid size-10 place-items-center rounded-full border transition-colors group-hover:text-white"
											>
												<ArrowUpRight />
											</span>
										</div>
									</div>
								</Link>
							</Reveal>
						)}

						<div className="mt-6 grid gap-6 md:grid-cols-2">
							{restProjects.map((project, index) => (
								<Reveal key={project.slug} delay={0.07 * (index + 1)}>
									<ProjectCard
										index={String(index + 2).padStart(2, "0")}
										title={project.title}
										category={project.category}
										summary={project.summary}
										year={project.year}
										status={project.status}
										image={project.image}
										href={to(`/projects/${project.slug}`)}
										linkAs={RouterLink}
										className="h-full"
									/>
								</Reveal>
							))}
						</div>
					</SectionFrame>
				</section>

				{/* 3. Interactive Studio Craft — 6-Band Escalating CRT TV (pauses only on active option or TV card) */}
				<section
					data-craft-showcase=""
					className="border-ink-800 border-b text-white"
				>
					<SectionFrame
						surfaceClass="bg-ink-900"
						dark
						innerClassName="px-4 py-16 sm:px-6 lg:px-8 lg:py-22"
						marksTop
					>
						<Reveal className="max-w-3xl">
							<p className="text-label mb-2.5 font-mono font-medium tracking-widest text-amber-300 uppercase">
								{t("home.craftEyebrow")}
							</p>
							<h2 className="font-display text-h2 max-[720px]:text-h3 text-white">
								{t("home.craftTitle")}
							</h2>
						</Reveal>

						<div className="mt-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
							{/* Discipline Selector: auto-cycle pauses only while hovering/focusing the ACTIVE option */}
							<Reveal
								delay={0.08}
								className="divide-ink-800 border-ink-800 divide-y border-y lg:col-span-5"
							>
								<div role="group" aria-label={t("home.craftDisciplines")}>
									{craftItems.map((item, idx) => {
										const selected = idx === activeCraftIndex;
										return (
											<button
												key={item.id}
												type="button"
												aria-pressed={selected}
												onMouseEnter={() => setCraftHoveredIdx(idx)}
												onMouseLeave={() =>
													setCraftHoveredIdx((curr) =>
														curr === idx ? null : curr
													)
												}
												onFocus={() => setCraftHoveredIdx(idx)}
												onBlur={() =>
													setCraftHoveredIdx((curr) =>
														curr === idx ? null : curr
													)
												}
												onClick={() => {
													setActiveCraftIndex(idx);
												}}
												className={cn(
													"focus-visible:outline-brand group relative flex w-full cursor-pointer items-start gap-4 overflow-hidden py-5 pr-3 pl-5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
													selected ? "bg-ink-800/85" : "hover:bg-ink-800/40"
												)}
											>
												{selected && (
													<motion.span
														layoutId="craft-active-bar"
														aria-hidden="true"
														transition={{
															type: "spring",
															stiffness: 380,
															damping: 32,
														}}
														className="bg-brand absolute inset-y-0 left-0 w-1"
													/>
												)}
												<span
													className={cn(
														"text-caption mt-1 shrink-0 font-mono font-medium tabular-nums transition-colors",
														selected ? "text-amber-300" : "text-ink-400"
													)}
												>
													{item.num}
												</span>
												<span className="min-w-0">
													<span className="font-display text-title block font-bold text-white">
														{item.title}
													</span>
													<span
														className={cn(
															"text-body-sm mt-1.5 block transition-colors",
															selected ? "text-ink-200" : "text-ink-400"
														)}
													>
														{item.description}
													</span>
												</span>
												{/* Always-mounted progress bar that smoothly rewinds to 0 when active option or TV card is hovered */}
												{selected && (
													<motion.span
														key={`craft-prog-${activeCraftIndex}`}
														aria-hidden="true"
														initial={{ scaleX: 0 }}
														animate={{ scaleX: craftPaused ? 0 : 1 }}
														transition={
															craftPaused
																? {
																		duration: 0.35,
																		ease: [0.22, 1, 0.36, 1],
																	}
																: {
																		duration: CRAFT_INTERVAL_MS / 1000,
																		ease: "linear",
																	}
														}
														className="bg-brand/80 absolute inset-x-0 bottom-0 h-0.5 origin-left"
													/>
												)}
											</button>
										);
									})}
								</div>
							</Reveal>

							{/* Crisp Retro CRT TV Monitor with 6-Band Escalating Glitch & Slide Enter Animation */}
							<Reveal delay={0.14} className="lg:col-span-7">
								<div
									data-craft-tv=""
									onMouseEnter={() => setCraftCardHovered(true)}
									onMouseLeave={() => setCraftCardHovered(false)}
									onFocusCapture={() => setCraftCardHovered(true)}
									onBlurCapture={(event) => {
										if (
											!event.currentTarget.contains(
												event.relatedTarget as Node | null
											)
										) {
											setCraftCardHovered(false);
										}
									}}
									className="border-ink-700 bg-ink-800 mx-auto max-w-2xl rounded-3xl border-2 p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)]"
								>
									{/* TV Bezel Top Hardware Bar */}
									<div className="mb-3 flex items-center justify-between px-1">
										<span className="text-caption inline-flex items-center gap-2 font-mono font-medium text-amber-300">
											<span
												aria-hidden="true"
												className="bg-brand size-2 rounded-full"
											/>
											OnTable - {activeCraft.project.title}
										</span>
										<div
											aria-hidden="true"
											className="hidden items-center gap-1.5 sm:flex"
										>
											<span className="bg-ink-900 h-1.5 w-6 rounded-full" />
											<span className="bg-ink-900 h-1.5 w-6 rounded-full" />
											<span className="bg-ink-900 h-1.5 w-6 rounded-full" />
										</div>
									</div>

									{/* Authentic CRT Screen: rock-solid sharp image + escalating scan-slice tears */}
									<CrtScreen
										src={activeCraft.image}
										alt={activeCraft.caption}
										glitchLevel={craftGlitch}
										fit="contain"
										className="aspect-16/10 rounded-2xl border-2 border-black"
									>
										<span
											aria-hidden="true"
											className="bg-ink-900/85 text-caption absolute top-3 left-3 z-10 rounded border border-white/15 px-2 py-0.5 font-mono text-amber-300"
										>
											PLAY ▶
										</span>
									</CrtScreen>

									{/* TV Bottom Caption & Action Deck */}
									<div className="mt-4 flex flex-col items-start justify-between gap-4 px-1 pb-1 sm:flex-row sm:items-center">
										<div className="min-w-0 flex-1">
											<p
												aria-live="polite"
												className="text-caption font-mono text-amber-300 uppercase"
											>
												{activeCraft.num} · {activeCraft.title}
											</p>
											<p className="text-body-sm text-ink-200 mt-1 line-clamp-2">
												{activeCraft.caption}
											</p>
										</div>
										<Link
											to={to(`/projects/${activeCraft.project.slug}`)}
											className="focus-visible:outline-brand hover:bg-cream hover:text-ink-900 group inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/25 px-4 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
										>
											{t("home.craftSeeGame", {
												title: activeCraft.project.title,
											})}
											<ArrowUpRight />
										</Link>
									</div>
								</div>
							</Reveal>
						</div>
					</SectionFrame>
				</section>

				{/* 4. Studio FAQ — Warm Sandstone Surface inside Architectural Rails */}
				<section data-faq="" className="border-ink-900/15 border-b">
					<SectionFrame
						surfaceClass="bg-sandstone"
						innerClassName="px-4 py-16 sm:px-6 lg:px-8 lg:py-22"
						marksTop
					>
						<div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
							<Reveal className="lg:col-span-4">
								<SectionHeader
									eyebrow={t("home.faqEyebrow")}
									title={t("home.faqTitle")}
									description={t("home.faqDescription")}
								/>
								<button
									type="button"
									onClick={openContact}
									className={cn(
										buttonVariants({ variant: "outline", size: "md" }),
										"mt-6"
									)}
								>
									{t("home.faqAsk")}
									<ArrowUpRight />
								</button>
							</Reveal>

							<Reveal delay={0.1} className="lg:col-span-8">
								<Accordion items={faqItems} defaultOpenId="play" />
							</Reveal>
						</div>
					</SectionFrame>
				</section>

				{/* 5. Bold Vermilion Retro Poster Collaboration Callout */}
				<section>
					<SectionFrame
						surfaceClass="bg-cream"
						innerClassName="px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
						marksTop
					>
						<Reveal>
							<div className="bg-brand border-ink-900 relative overflow-hidden rounded-3xl border-2 px-6 py-10 text-white shadow-[6px_6px_0_0_#171513] sm:px-10 sm:py-12 lg:p-14">
								<div
									aria-hidden="true"
									className="crt-scanlines pointer-events-none absolute inset-0 opacity-12"
								/>
								<div className="relative z-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
									<div className="max-w-2xl">
										<p className="text-label bg-ink-900 mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1 font-mono font-medium tracking-widest text-amber-300 uppercase">
											{t("home.ctaEyebrow")}
										</p>
										<h2 className="font-display text-h2 max-[720px]:text-h3 text-white">
											{t("home.ctaTitle")}
										</h2>
										<p className="text-body-lg mt-4 max-w-xl font-medium text-white/95">
											{t("home.ctaDescription")}
										</p>
									</div>
									<div className="flex flex-wrap gap-3">
										<button
											type="button"
											onClick={openContact}
											className="focus-visible:outline-ink-900 bg-ink-900 hover:bg-ink-800 group/button inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full px-7 text-base font-semibold text-white shadow-[0_3px_0_0_rgba(23,21,19,0.4)] transition-[background-color,scale,translate] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0.5 active:scale-[0.97]"
										>
											{t("home.contact")}
											<ArrowUpRight />
										</button>
										<Link
											to={to("/projects")}
											className="focus-visible:outline-ink-900 bg-cream text-ink-900 hover:bg-parchment border-ink-900 inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 px-7 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]"
										>
											{t("home.viewProjects")}
										</Link>
									</div>
								</div>
							</div>
						</Reveal>
					</SectionFrame>
				</section>
			</main>

			<Footer />
		</div>
	);
}
