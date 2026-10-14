import { useEffect, useState } from "react";
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
	"focus-visible:outline-brand grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25 focus-visible:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * A full-screen preview of one picture from a set, in a `Modal`. The arrow keys and
 * the buttons step through the set. The picture carries the view transition name
 * `preview`, so a thumbnail with the same name can zoom into it.
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

	return (
		<Modal
			label={t("lightbox.label")}
			onClose={onClose}
			backdropName="preview-backdrop"
		>
			<button
				type="button"
				aria-label={t("lightbox.close")}
				onClick={onClose}
				className={cn(controlClass, "absolute top-4 right-4")}
			>
				<span aria-hidden="true">×</span>
			</button>
			{count > 1 && (
				<button
					type="button"
					aria-label={t("lightbox.previous")}
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
					aria-label={t("lightbox.next")}
					onClick={() => step(1)}
					className={cn(
						controlClass,
						"absolute top-1/2 right-4 -translate-y-1/2"
					)}
				>
					<span aria-hidden="true">›</span>
				</button>
			)}
		</Modal>
	);
}
