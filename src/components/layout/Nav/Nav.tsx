import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { SITE } from "../../../common/constants";
import { Container } from "../../ui/Container";

const LINKS = [
	{ label: "Projects", to: "/projects" },
	{ label: "Contact", to: `mailto:${SITE.email}` },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
	return LINKS.map((link) =>
		link.to.startsWith("mailto:") ? (
			<a
				key={link.label}
				href={link.to}
				onClick={onNavigate}
				className="text-body hover:text-brand font-medium"
			>
				{link.label}
			</a>
		) : (
			<Link
				key={link.label}
				to={link.to}
				onClick={onNavigate}
				className="text-body hover:text-brand font-medium"
			>
				{link.label}
			</Link>
		)
	);
}

/** Sticky top bar: logo and links, collapsing to a menu on small screens. */
export function Nav(): React.JSX.Element {
	const [open, setOpen] = useState(false);
	const toggleRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				toggleRef.current?.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open]);

	return (
		<nav className="bg-canvas/90 border-surface-border sticky top-0 z-50 border-b backdrop-blur">
			<Container className="flex h-16 items-center justify-between">
				<Link to="/" className="flex items-center gap-3">
					<img
						src="/images/ontable-logo.svg"
						alt=""
						className="size-9 rounded-xl"
					/>
					<span className="font-display text-title">OnTable</span>
					<span className="sr-only">Studio, home</span>
				</Link>

				<div className="flex items-center gap-8 max-[720px]:hidden">
					<NavLinks />
				</div>

				<button
					ref={toggleRef}
					type="button"
					aria-label="Menu"
					aria-expanded={open}
					aria-controls="mobile-menu"
					onClick={() => setOpen((value) => !value)}
					className="hidden size-11 cursor-pointer items-center justify-center max-[720px]:flex"
				>
					<span aria-hidden="true" className="text-2xl">
						{open ? "×" : "≡"}
					</span>
				</button>
			</Container>

			{open && (
				<div
					id="mobile-menu"
					className="border-surface-border flex flex-col gap-4 border-t px-6 py-4 min-[721px]:hidden"
				>
					<NavLinks onNavigate={() => setOpen(false)} />
				</div>
			)}
		</nav>
	);
}
