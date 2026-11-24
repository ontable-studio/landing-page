import { useId, useRef, useState } from "react";
import { cn } from "../../../lib/cn";

export interface AccordionItem {
	id: string;
	index?: string;
	question: string;
	answer: string;
}

interface AccordionProps {
	items: AccordionItem[];
	/** Allow multiple panels open at once. Defaults to false (single open item). */
	allowMultiple?: boolean;
	/** Optional item id open on initial mount. */
	defaultOpenId?: string;
	className?: string;
}

function PlusIcon({ open }: { open: boolean }): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			className={cn(
				"size-4 transition-transform duration-200",
				open && "rotate-45"
			)}
		>
			<path d="M8 3v10M3 8h10" />
		</svg>
	);
}

/**
 * Accessible WAI-ARIA disclosure accordion with smooth CSS grid-row expansion
 * and ArrowUp / ArrowDown / Home / End keyboard navigation across headers.
 */
export function Accordion({
	items,
	allowMultiple = false,
	defaultOpenId,
	className,
}: AccordionProps): React.JSX.Element {
	const baseId = useId();
	const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const [openIds, setOpenIds] = useState<string[]>(() =>
		defaultOpenId ? [defaultOpenId] : []
	);

	function toggle(id: string) {
		setOpenIds((current) => {
			const isOpen = current.includes(id);
			if (isOpen) return current.filter((item) => item !== id);
			return allowMultiple ? [...current, id] : [id];
		});
	}

	function onKeyDown(event: React.KeyboardEvent, index: number) {
		const count = items.length;
		if (count === 0) return;
		let targetIndex: number | null = null;
		switch (event.key) {
			case "ArrowDown":
				targetIndex = (index + 1) % count;
				break;
			case "ArrowUp":
				targetIndex = (index - 1 + count) % count;
				break;
			case "Home":
				targetIndex = 0;
				break;
			case "End":
				targetIndex = count - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		triggerRefs.current[targetIndex]?.focus();
	}

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			{items.map((item, index) => {
				const open = openIds.includes(item.id);
				const triggerId = `${baseId}-trigger-${item.id}`;
				const panelId = `${baseId}-panel-${item.id}`;
				const num = item.index ?? String(index + 1).padStart(2, "0");

				return (
					<div
						key={item.id}
						className={cn(
							"rounded-2xl border px-5 transition-[background-color,border-color,box-shadow] duration-200",
							open
								? "border-ink-900/25 bg-cream shadow-[4px_4px_0_0_rgba(23,21,19,0.1)]"
								: "border-ink-300/80 bg-cream/75 hover:border-ink-400 hover:bg-cream"
						)}
					>
						<h3 className="m-0">
							<button
								ref={(node) => {
									triggerRefs.current[index] = node;
								}}
								id={triggerId}
								type="button"
								aria-expanded={open}
								aria-controls={panelId}
								onClick={() => toggle(item.id)}
								onKeyDown={(event) => onKeyDown(event, index)}
								className="focus-visible:outline-brand group flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
							>
								<span className="flex items-baseline gap-3.5 pr-2">
									<span className="text-caption text-brand-ink shrink-0 font-mono font-medium tabular-nums">
										FAQ-{num}
									</span>
									<span className="font-display text-title text-text-primary group-hover:text-brand-ink font-bold transition-colors">
										{item.question}
									</span>
								</span>
								<span
									aria-hidden="true"
									className={cn(
										"grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-200",
										open
											? "border-ink-900 bg-ink-900 text-amber-300"
											: "border-ink-300 bg-parchment text-ink-700 group-hover:border-ink-500"
									)}
								>
									<PlusIcon open={open} />
								</span>
							</button>
						</h3>

						<div
							id={panelId}
							role="region"
							aria-labelledby={triggerId}
							hidden={!open}
							className={cn(
								"grid transition-[grid-template-rows] duration-250 ease-out",
								open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
							)}
						>
							<div className="overflow-hidden">
								<p className="text-body text-text-secondary border-ink-200/80 border-t pt-3.5 pb-5 sm:max-w-2xl">
									{item.answer}
								</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
