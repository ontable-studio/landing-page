import { useRef } from "react";
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
			className={cn("flex gap-2 overflow-x-auto pb-1", className)}
		>
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
							"text-body-sm focus-visible:outline-brand inline-flex h-10 cursor-pointer items-center rounded-full border px-5 font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
							selected
								? "bg-text-primary border-text-primary text-white"
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
