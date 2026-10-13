import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../../lib/cn";

export interface TabItem {
	id: string;
	label: string;
}

interface TabsProps {
	items: TabItem[];
	/** The id of the selected tab. */
	value: string;
	// eslint-disable-next-line no-unused-vars -- the base rule misreads parameter names in type signatures
	onValueChange: (id: string) => void;
	/** Names the tab list for assistive technology. */
	ariaLabel: string;
	/** The id of the `role="tabpanel"` element these tabs control. */
	panelId: string;
	className?: string;
}

/** The id a tab gets, so its panel can name it with `aria-labelledby`. */
export function tabId(panelId: string, id: string): string {
	return `${panelId}-tab-${id}`;
}

/** Pill tabs with the arrow-key, Home and End behaviour of a WAI-ARIA tab list. */
export function Tabs({
	items,
	value,
	onValueChange,
	ariaLabel,
	panelId,
	className,
}: TabsProps): React.JSX.Element {
	const refs = useRef<(HTMLButtonElement | null)[]>([]);
	const selectedIndex = items.findIndex((item) => item.id === value);
	const [slot, setSlot] = useState<{ left: number; width: number } | null>(
		null
	);

	// Measure the selected tab so the indicator can sit behind it, and again when
	// the window resizes or the fonts finish loading (both change the tab widths).
	useLayoutEffect(() => {
		const measure = () => {
			const tab = refs.current[selectedIndex];
			if (tab) setSlot({ left: tab.offsetLeft, width: tab.offsetWidth });
		};
		measure();
		window.addEventListener("resize", measure);
		void document.fonts?.ready.then(measure);
		return () => window.removeEventListener("resize", measure);
	}, [selectedIndex, items]);

	function select(index: number) {
		const next = (index + items.length) % items.length;
		onValueChange(items[next].id);
		refs.current[next]?.focus();
	}

	function onKeyDown(event: React.KeyboardEvent, index: number) {
		const moves: Record<string, number> = {
			ArrowRight: index + 1,
			ArrowLeft: index - 1,
			Home: 0,
			End: items.length - 1,
		};
		if (event.key in moves) {
			event.preventDefault();
			select(moves[event.key]);
		}
	}

	return (
		<div
			role="tablist"
			aria-label={ariaLabel}
			className={cn("relative flex gap-2 overflow-x-auto pb-1", className)}
		>
			{slot && (
				<span
					data-indicator=""
					aria-hidden="true"
					className="bg-text-primary absolute top-0 left-0 h-10 rounded-full transition-[transform,width] duration-300 ease-out"
					style={{
						transform: `translateX(${slot.left}px)`,
						width: slot.width,
					}}
				/>
			)}
			{items.map((item, index) => {
				const selected = item.id === value;
				return (
					<button
						key={item.id}
						ref={(node) => {
							refs.current[index] = node;
						}}
						id={tabId(panelId, item.id)}
						type="button"
						role="tab"
						aria-selected={selected}
						aria-controls={panelId}
						tabIndex={selected ? 0 : -1}
						onClick={() => onValueChange(item.id)}
						onKeyDown={(event) => onKeyDown(event, index)}
						className={cn(
							"text-body-sm focus-visible:outline-brand relative z-10 inline-flex h-10 cursor-pointer items-center rounded-full border px-5 font-medium whitespace-nowrap transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
							selected
								? "border-text-primary text-white"
								: "border-surface-border text-text-primary hover:bg-surface"
						)}
					>
						{item.label}
					</button>
				);
			})}
		</div>
	);
}
