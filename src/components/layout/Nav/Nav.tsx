import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Container } from "../../ui/Container";
import { underlineLink } from "../../ui/linkStyles";
import { useContact } from "../Contact";

/** Projects and Contact. Contact opens the contact dialog instead of leaving the page. */
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
	const { open } = useContact();
	const itemClass = `text-body font-medium ${underlineLink}`;
	return (
		<>
			<Link to="/projects" onClick={onNavigate} className={itemClass}>
				Projects
			</Link>
			<button
				type="button"
				onClick={() => {
					onNavigate?.();
					open();
				}}
				className={`${itemClass} cursor-pointer`}
			>
				Contact
			</button>
		</>
	);
}

interface NavProps {
	/** `bar`: plain bar that scrolls away with the page. `overlay`: plain row that sits inside a full-screen section. */
	variant?: "bar" | "overlay";
}

/** Centred container for the bar, full-bleed padded row for the overlay. */
function Wrapper({
	overlay,
	children,
}: {
	overlay: boolean;
	children: React.ReactNode;
}) {
	return overlay ? (
		<div className="flex h-20 w-full items-center justify-between px-6 lg:px-10">
			{children}
		</div>
	) : (
		<Container size="wide" className="flex h-16 items-center justify-between">
			{children}
		</Container>
	);
}

/** Top navigation: logo and links, collapsing to a menu on small screens. */
export function Nav({ variant = "bar" }: NavProps): React.JSX.Element {
	const overlay = variant === "overlay";
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
		<nav className={overlay ? "relative z-20" : "bg-canvas"}>
			<Wrapper overlay={overlay}>
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
			</Wrapper>

			{open && (
				<div
					id="mobile-menu"
					className={
						overlay
							? "bg-canvas absolute inset-x-6 top-full z-30 flex flex-col gap-4 rounded-2xl p-5 min-[721px]:hidden"
							: "flex flex-col gap-4 px-6 py-4 min-[721px]:hidden"
					}
				>
					<NavLinks
						onNavigate={() => {
							// Hand focus to the toggle first: the menu is about to go away, and
							// the contact dialog gives focus back to where it was opened from.
							toggleRef.current?.focus();
							setOpen(false);
						}}
					/>
				</div>
			)}
		</nav>
	);
}
