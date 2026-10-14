import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useT } from "../../../i18n";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Container } from "../../ui/Container";
import { underlineLink } from "../../ui/linkStyles";
import { useContact } from "../Contact";

/** Projects and Contact. Contact opens the contact dialog instead of leaving the page. */
function NavLinks({
	onNavigate,
	stacked = false,
}: {
	onNavigate?: () => void;
	/** In the mobile menu: full-width rows with a comfortable tap size. */
	stacked?: boolean;
}) {
	const { open } = useContact();
	const { t, to } = useT();
	const itemClass = stacked
		? "focus-visible:outline-brand hover:bg-ink-100 focus-visible:bg-ink-100 text-body flex h-12 w-full cursor-pointer items-center rounded-xl px-4 text-left font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
		: `text-body font-medium ${underlineLink}`;
	return (
		<>
			<Link to={to("/projects")} onClick={onNavigate} className={itemClass}>
				{t("nav.projects")}
			</Link>
			<button
				type="button"
				onClick={() => {
					onNavigate?.();
					open();
				}}
				className={`${itemClass} cursor-pointer`}
			>
				{t("nav.contact")}
			</button>
			<LanguageSwitcher
				className={
					stacked ? "border-surface-border mt-1 border-t px-2 pt-3" : undefined
				}
			/>
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
		<div className="flex h-16 w-full items-center justify-between px-4 lg:h-20 lg:px-10">
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
	const { t, to } = useT();
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
				<Link to={to("/")} className="flex items-center gap-3">
					<img
						src="/images/ontable-logo.svg"
						alt=""
						className="size-9 rounded-xl"
					/>
					<span className="font-display text-title">OnTable</span>
					<span className="sr-only">{t("nav.homeLabel")}</span>
				</Link>

				<div className="flex items-center gap-8 max-[720px]:hidden">
					<NavLinks />
				</div>

				<button
					ref={toggleRef}
					type="button"
					aria-label={t("nav.menu")}
					aria-expanded={open}
					aria-controls="mobile-menu"
					onClick={() => setOpen((value) => !value)}
					className="focus-visible:outline-brand hover:bg-surface focus-visible:bg-surface -mr-2 hidden size-11 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 max-[720px]:flex"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						aria-hidden="true"
						className="size-6"
					>
						<path
							d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
						/>
					</svg>
				</button>
			</Wrapper>

			{open && (
				<div
					id="mobile-menu"
					className={
						overlay
							? "bg-canvas border-surface-border absolute inset-x-4 top-full z-30 flex flex-col gap-1 rounded-2xl border p-2 shadow-xl shadow-black/10 min-[721px]:hidden"
							: "bg-surface mx-4 mb-4 flex flex-col gap-1 rounded-2xl p-2 min-[721px]:hidden"
					}
				>
					<NavLinks
						stacked
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
