import { useEffect, useRef, useState } from "react";
import { useT } from "../../../i18n";
import { cn } from "../../../lib/cn";
import { Modal } from "../Modal";

export interface LightboxItem {
	src: string;
	alt: string;
}

interface LightboxProps {
	items: LightboxItem[];
	/** The picture being shown, or `null` while closed. */
	index: number | null;
	// eslint-disable-next-line no-unused-vars -- the base rule misreads parameter names in type signatures
	onIndexChange: (index: number) => void;
	onClose: () => void;
}

const controlClass =
	"focus-visible:outline-brand bg-ink-900/90 hover:bg-ink-800 focus-visible:bg-ink-800 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white shadow-lg shadow-black/40 transition-[background-color,border-color,scale] duration-150 hover:border-white/40 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2";

function CloseIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.9"
			strokeLinecap="round"
			className="size-5"
		>
			<path d="M5 5l10 10M15 5 5 15" />
		</svg>
	);
}

function ChevronLeftIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-5 -translate-x-px"
		>
			<path d="M12.5 4.5 7 10l5.5 5.5" />
		</svg>
	);
}

function ChevronRightIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-5 translate-x-px"
		>
			<path d="M7.5 4.5 13 10l-5.5 5.5" />
		</svg>
	);
}

/**
 * A full-screen preview of one picture from a set, in a `Modal`.
 * Features optically centered SVG arrows, a bottom-anchored pagination dock with
 * clickable indicators, keyboard navigation (Arrows, Home, End, Esc), and touch swipe.
 */
export function Lightbox({
	items,
	index,
	onIndexChange,
	onClose,
}: LightboxProps): React.JSX.Element | null {
	const { t } = useT();
	const open = index !== null;
	const current = index ?? 0;
	const count = items.length;
	const [stepped, setStepped] = useState(false);
	const touchStartX = useRef<number | null>(null);

	useEffect(() => {
		if (!open) setStepped(false);
	}, [open]);

	useEffect(() => {
		if (!open || count < 2) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				setStepped(true);
				onIndexChange((current + 1) % count);
			} else if (event.key === "ArrowLeft") {
				setStepped(true);
				onIndexChange((current - 1 + count) % count);
			} else if (event.key === "Home") {
				event.preventDefault();
				setStepped(true);
				onIndexChange(0);
			} else if (event.key === "End") {
				event.preventDefault();
				setStepped(true);
				onIndexChange(count - 1);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, current, count, onIndexChange]);

	if (!open || !items[current]) return null;
	const item = items[current];

	function step(offset: number) {
		setStepped(true);
		onIndexChange((current + offset + count) % count);
	}

	function jumpTo(target: number) {
		setStepped(true);
		onIndexChange(target);
	}

	function onTouchStart(event: React.TouchEvent) {
		touchStartX.current = event.touches[0]?.clientX ?? null;
	}

	function onTouchEnd(event: React.TouchEvent) {
		if (touchStartX.current === null || count < 2) return;
		const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
		const delta = endX - touchStartX.current;
		touchStartX.current = null;
		if (Math.abs(delta) >= 48) {
			step(delta < 0 ? 1 : -1);
		}
	}

	return (
		<Modal
			label={t("lightbox.label")}
			onClose={onClose}
			backdropName="preview-backdrop"
			className="justify-between gap-0 p-4 sm:p-6"
		>
			{/* Top bar: subtle keyboard hint + centered Close button */}
			<div
				className="flex w-full items-center justify-between gap-4"
				onClick={(event) => {
					if (event.target === event.currentTarget) onClose();
				}}
			>
				<p
					aria-hidden="true"
					className="text-caption hidden font-mono text-white/60 sm:block"
				>
					{count > 1 ? t("lightbox.hint") : "Esc"}
				</p>
				<button
					type="button"
					aria-label={t("lightbox.close")}
					onClick={onClose}
					className={cn(controlClass, "ml-auto")}
				>
					<CloseIcon />
				</button>
			</div>

			{/* Middle stage: optically centered Prev / Image / Next */}
			<div
				className="relative flex min-h-0 w-full flex-1 items-center justify-center gap-3 py-4 sm:gap-5"
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}
				onClick={(event) => {
					if (event.target === event.currentTarget) onClose();
				}}
			>
				{count > 1 && (
					<button
						type="button"
						aria-label={t("lightbox.previous")}
						onClick={() => step(-1)}
						className={cn(
							controlClass,
							"max-sm:absolute max-sm:left-1 max-sm:z-10"
						)}
					>
						<ChevronLeftIcon />
					</button>
				)}

				<div
					className="flex max-h-full min-w-0 flex-1 items-center justify-center"
					onClick={(event) => {
						if (event.target === event.currentTarget) onClose();
					}}
				>
					<img
						key={current}
						src={item.src}
						alt={item.alt}
						className={cn(
							"max-h-[70svh] w-auto max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl shadow-black/60",
							stepped && "animate-fade-in"
						)}
						style={{ viewTransitionName: "preview" }}
					/>
				</div>

				{count > 1 && (
					<button
						type="button"
						aria-label={t("lightbox.next")}
						onClick={() => step(1)}
						className={cn(
							controlClass,
							"max-sm:absolute max-sm:right-1 max-sm:z-10"
						)}
					>
						<ChevronRightIcon />
					</button>
				)}
			</div>

			{/* Bottom anchored dock: caption + interactive pagination dots + counter */}
			<div
				data-lightbox-footer=""
				className="flex w-full flex-col items-center gap-3 pb-1"
				onClick={(event) => {
					if (event.target === event.currentTarget) onClose();
				}}
			>
				<p className="text-body-sm max-w-2xl text-center text-white/90">
					{item.alt}
				</p>
				{count > 1 && (
					<div className="bg-ink-900/90 inline-flex items-center gap-3 rounded-full border border-white/15 px-3.5 py-1.5">
						<div
							role="group"
							aria-label={t("lightbox.pagination")}
							className="flex items-center gap-1"
						>
							{items.map((entry, idx) => {
								const active = idx === current;
								return (
									<button
										key={`${entry.src}-${idx}`}
										type="button"
										aria-label={t("lightbox.goTo", {
											current: idx + 1,
											total: count,
										})}
										aria-current={active ? "true" : undefined}
										onClick={() => jumpTo(idx)}
										className="focus-visible:outline-brand group grid size-6 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1"
									>
										<span
											aria-hidden="true"
											className={cn(
												"block h-2 rounded-full transition-all duration-200",
												active
													? "bg-brand w-5"
													: "w-2 bg-white/40 group-hover:bg-white/75"
											)}
										/>
									</button>
								);
							})}
						</div>
						<span aria-hidden="true" className="h-3.5 w-px bg-white/15" />
						<p
							aria-live="polite"
							className="text-caption font-mono font-medium text-white/80 tabular-nums"
						>
							{current + 1} / {count}
						</p>
					</div>
				)}
			</div>
		</Modal>
	);
}
