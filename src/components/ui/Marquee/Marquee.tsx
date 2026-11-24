import { cn } from "../../../lib/cn";

export interface MarqueeEntry {
	label: string;
	meta?: string;
}

interface MarqueeProps {
	items: MarqueeEntry[];
	className?: string;
}

/**
 * Full-bleed dark-ink kinetic ribbon that loops studio titles & craft genres smoothly,
 * pausing on pointer hover. The duplicated track is hidden from assistive technology.
 */
export function Marquee({ items, className }: MarqueeProps): React.JSX.Element {
	const renderTrack = (duplicate: boolean) => (
		<div
			aria-hidden={duplicate || undefined}
			className="flex shrink-0 items-center gap-8 pr-8"
		>
			{items.map((item, idx) => (
				<span
					key={`${item.label}-${idx}`}
					className="inline-flex items-center gap-3 whitespace-nowrap"
				>
					<span className="font-display text-body font-bold tracking-tight text-white">
						{item.label}
					</span>
					{item.meta && (
						<span className="text-caption text-ink-300 font-mono tracking-[0.08em] uppercase">
							{item.meta}
						</span>
					)}
					<span
						aria-hidden="true"
						className="text-brand ml-5 text-xs select-none"
					>
						◆
					</span>
				</span>
			))}
		</div>
	);

	return (
		<div
			data-marquee=""
			className={cn(
				"bg-ink-900 border-ink-800 group overflow-hidden border-y py-3.5 text-white",
				className
			)}
		>
			<div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
				{renderTrack(false)}
				{renderTrack(true)}
			</div>
		</div>
	);
}
