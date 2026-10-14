import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/cn";

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
	"focus-visible:outline-brand grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25 focus-visible:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * A full-screen preview of one picture from a set. Esc closes, the arrow keys and
 * the buttons step through the set, Tab stays inside, the page behind does not
 * scroll, and focus goes back to whatever opened it. The picture carries the view
 * transition name `preview`, so a thumbnail with the same name can zoom into it.
 */
export function Lightbox({
	items,
	index,
	onIndexChange,
	onClose,
}: LightboxProps): React.JSX.Element | null {
	const open = index !== null;
	const current = index ?? 0;
	const count = items.length;
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const [stepped, setStepped] = useState(false);

	useEffect(() => {
		if (!open) return;
		const opener = document.activeElement as HTMLElement | null;
		closeRef.current?.focus();
		const { overflow, paddingRight } = document.body.style;
		const gutter = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = "hidden";
		if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
		return () => {
			document.body.style.overflow = overflow;
			document.body.style.paddingRight = paddingRight;
			setStepped(false);
			if (opener?.isConnected) opener.focus();
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			} else if (count > 1 && event.key === "ArrowRight") {
				setStepped(true);
				onIndexChange((current + 1) % count);
			} else if (count > 1 && event.key === "ArrowLeft") {
				setStepped(true);
				onIndexChange((current - 1 + count) % count);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, current, count, onClose, onIndexChange]);

	if (!open || !items[current]) return null;
	const item = items[current];

	function step(offset: number) {
		setStepped(true);
		onIndexChange((current + offset + count) % count);
	}

	function keepFocusInside(event: React.KeyboardEvent) {
		if (event.key !== "Tab") return;
		const buttons = dialogRef.current?.querySelectorAll<HTMLElement>("button");
		if (!buttons?.length) return;
		const first = buttons[0];
		const last = buttons[buttons.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	return createPortal(
		<div
			ref={dialogRef}
			role="dialog"
			aria-modal="true"
			aria-label="Image preview"
			onKeyDown={keepFocusInside}
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 p-4"
		>
			<div
				data-backdrop=""
				aria-hidden="true"
				onClick={onClose}
				className="absolute inset-0 bg-black/90"
				style={{ viewTransitionName: "preview-backdrop" }}
			/>
			<button
				ref={closeRef}
				type="button"
				aria-label="Close preview"
				onClick={onClose}
				className={cn(controlClass, "absolute top-4 right-4")}
			>
				<span aria-hidden="true">×</span>
			</button>
			{count > 1 && (
				<button
					type="button"
					aria-label="Previous image"
					onClick={() => step(-1)}
					className={cn(
						controlClass,
						"absolute top-1/2 left-4 -translate-y-1/2"
					)}
				>
					<span aria-hidden="true">‹</span>
				</button>
			)}
			<figure className="relative flex max-w-6xl flex-col items-center gap-3">
				<img
					key={current}
					src={item.src}
					alt={item.alt}
					className={cn(
						"max-h-[78svh] w-auto max-w-full rounded-2xl object-contain",
						stepped && "animate-fade-in"
					)}
					style={{ viewTransitionName: "preview" }}
				/>
				<figcaption className="text-body-sm max-w-prose text-center text-white/80">
					{item.alt}
				</figcaption>
				{count > 1 && (
					<p aria-live="polite" className="text-body-sm text-white/60">
						{current + 1} / {count}
					</p>
				)}
			</figure>
			{count > 1 && (
				<button
					type="button"
					aria-label="Next image"
					onClick={() => step(1)}
					className={cn(
						controlClass,
						"absolute top-1/2 right-4 -translate-y-1/2"
					)}
				>
					<span aria-hidden="true">›</span>
				</button>
			)}
		</div>,
		document.body
	);
}
