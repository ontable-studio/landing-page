import { cn } from "../../../lib/cn";

interface SocialLink {
	label: string;
	href: string;
}

const iconProps = {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 1.8,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
	"aria-hidden": true,
	className: "size-4",
};

/** A small icon for the networks we link to; others get none. */
function icon(label: string): React.JSX.Element | null {
	switch (label.toLowerCase()) {
		case "instagram":
			return (
				<svg {...iconProps}>
					<rect x="3" y="3" width="18" height="18" rx="5" />
					<circle cx="12" cy="12" r="4" />
					<circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
				</svg>
			);
		case "itch.io":
			return (
				<svg {...iconProps}>
					<rect x="2.5" y="7" width="19" height="11" rx="5.5" />
					<path d="M7 10.5v4M5 12.5h4" />
					<circle
						cx="15.5"
						cy="11.5"
						r="0.9"
						fill="currentColor"
						stroke="none"
					/>
					<circle cx="18" cy="14" r="0.9" fill="currentColor" stroke="none" />
				</svg>
			);
		default:
			return null;
	}
}

/** Links to the studio's profiles as pill chips with an icon, opening in a new tab. */
export function SocialChips({
	links,
	className,
}: {
	links: SocialLink[];
	className?: string;
}): React.JSX.Element {
	return (
		<ul className={cn("flex flex-wrap gap-2", className)}>
			{links.map((link) => (
				<li key={link.href}>
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className="focus-visible:outline-brand border-surface-border text-text-primary hover:bg-surface focus-visible:bg-surface text-body-sm inline-flex h-9 items-center gap-2 rounded-full border px-4 font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2"
					>
						{icon(link.label)}
						{link.label}
					</a>
				</li>
			))}
		</ul>
	);
}
