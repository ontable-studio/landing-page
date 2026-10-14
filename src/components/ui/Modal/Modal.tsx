import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/cn";

const FOCUSABLE =
	"a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])";

interface ModalProps {
	/** Names the dialog for assistive technology. */
	label: string;
	onClose: () => void;
	children: React.ReactNode;
	/** Classes for the dialog layer, which centres its children by default. */
	className?: string;
	/** A view transition name for the backdrop, so it can fade while something zooms. */
	backdropName?: string;
}

/**
 * A modal dialog on a plain dark backdrop (no blur). While it is mounted: Esc and
 * a click outside the content close it, Tab stays inside, the page behind does not
 * scroll, focus moves in (to `[data-autofocus]`, else the first control) and goes
 * back to whatever opened it. The parent mounts it only while open.
 */
export function Modal({
	label,
	onClose,
	children,
	className,
	backdropName,
}: ModalProps): React.JSX.Element {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const opener = document.activeElement as HTMLElement | null;
		const dialog = dialogRef.current;
		(
			dialog?.querySelector<HTMLElement>("[data-autofocus]") ??
			dialog?.querySelector<HTMLElement>(FOCUSABLE)
		)?.focus();
		const { overflow, paddingRight } = document.body.style;
		const gutter = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = "hidden";
		if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
		return () => {
			document.body.style.overflow = overflow;
			document.body.style.paddingRight = paddingRight;
			if (opener?.isConnected) opener.focus();
		};
	}, []);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	function keepFocusInside(event: React.KeyboardEvent) {
		if (event.key !== "Tab") return;
		const controls =
			dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
		if (!controls?.length) return;
		const first = controls[0];
		const last = controls[controls.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	return createPortal(
		<div
			ref={dialogRef}
			role="dialog"
			aria-modal="true"
			aria-label={label}
			onKeyDown={keepFocusInside}
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			className={cn(
				"fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 p-4",
				className
			)}
		>
			<div
				data-backdrop=""
				aria-hidden="true"
				onClick={onClose}
				className="absolute inset-0 -z-10 bg-black/90"
				style={backdropName ? { viewTransitionName: backdropName } : undefined}
			/>
			{children}
		</div>,
		document.body
	);
}
