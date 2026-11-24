import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useT } from "../../../i18n";
import { cn } from "../../../lib/cn";
import { LanguageSwitcher } from "../LanguageSwitcher";
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
	const { pathname } = useLocation();
	const projectsPath = to("/projects");
	const onProjects =
		pathname === projectsPath || pathname.startsWith(`${projectsPath}/`);

	const itemClass = stacked
		? "focus-visible:outline-brand hover:bg-sandstone/70 focus-visible:bg-sandstone/70 text-body flex h-12 w-full cursor-pointer items-center rounded-xl px-4 text-left font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
		: `text-body font-medium ${underlineLink}`;
	return (
		<>
			<Link
				to={projectsPath}
				onClick={onNavigate}
				aria-current={onProjects ? "page" : undefined}
				className={cn(itemClass, onProjects && "text-brand-ink")}
			>
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
			<LanguageSwitcher className={stacked ? "mt-2 self-start" : undefined} />
		</>
	);
}

interface NavProps {
	/** Kept for API compatibility; both variants render the fixed parchment navigation rail. */
	variant?: "bar" | "overlay";
}

/** Fixed top navigation bar matching Footer's warm parchment surface & continuous page rails. */
export function Nav({ variant = "bar" }: NavProps): React.JSX.Element {
	const { t, to } = useT();
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
		<nav
			data-variant={variant}
			className="bg-parchment hatch-gutter border-ink-900/15 fixed inset-x-0 top-0 z-50 border-b shadow-[0_2px_12px_-6px_rgba(23,21,19,0.16)]"
		>
			<div className="bg-parchment border-ink-900/15 mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 min-[1320px]:border-x sm:px-6 lg:h-18 lg:px-8">
				<Link
					to={to("/")}
					className="focus-visible:outline-brand group flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
				>
					<img
						src="/images/ontable-logo.svg"
						alt=""
						className="size-9 rounded-xl transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-6"
					/>
					<span className="font-display text-title font-bold tracking-tight">
						OnTable
					</span>
					<span className="sr-only">{t("nav.homeLabel")}</span>
				</Link>

				<div className="flex items-center gap-7 max-[720px]:hidden">
					<NavLinks />
				</div>

				<button
					ref={toggleRef}
					type="button"
					aria-label={t("nav.menu")}
					aria-expanded={open}
					aria-controls="mobile-menu"
					onClick={() => setOpen((value) => !value)}
					className="focus-visible:outline-brand hover:bg-sandstone/70 focus-visible:bg-sandstone/70 -mr-2 hidden size-11 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 max-[720px]:flex"
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
			</div>

			{open && (
				<div
					id="mobile-menu"
					className="bg-parchment border-ink-900/15 absolute inset-x-4 top-full z-50 mt-2 flex flex-col gap-1 rounded-2xl border p-3 shadow-xl shadow-black/15 min-[721px]:hidden"
				>
					<NavLinks
						stacked
						onNavigate={() => {
							toggleRef.current?.focus();
							setOpen(false);
						}}
					/>
				</div>
			)}
		</nav>
	);
}
