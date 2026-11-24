import { useRef, useState } from "react";
import { SITE } from "../../../common/constants";
import { useT, type TextKey } from "../../../i18n";
import { cn } from "../../../lib/cn";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { SocialChips } from "../../ui/SocialChips";
import {
	contactMailto,
	validateContact,
	type ContactErrors,
	type ContactValues,
} from "./mailto";

interface ContactDialogProps {
	onClose: () => void;
	/** Hands over the `mailto:` link; by default it opens the visitor's email app. */
	// eslint-disable-next-line no-unused-vars -- the base rule misreads parameter names in type signatures
	onSend?: (url: string) => void;
}

const FIELDS = ["name", "email", "message"] as const;
const MAX_MESSAGE = 1500;

const TOPIC_KEYS: TextKey[] = [
	"contact.topicCollab",
	"contact.topicFeedback",
	"contact.topicPress",
	"contact.topicGeneral",
];

const inputBaseClass =
	"border-ink-300/90 bg-canvas hover:border-ink-400 focus-visible:border-ink-900 focus-visible:ring-brand/25 placeholder:text-ink-400 text-body text-text-primary w-full rounded-xl border py-3 transition-[border-color,box-shadow,background-color] duration-150 focus-visible:ring-3 focus-visible:outline-none";

function openMailApp(url: string) {
	window.location.href = url;
}

function CloseIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			className="size-4"
		>
			<path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" />
		</svg>
	);
}

function UserIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-ink-400 pointer-events-none size-4"
		>
			<circle cx="8" cy="5.5" r="2.5" />
			<path d="M3 13.5c.8-2.3 2.7-3.5 5-3.5s4.2 1.2 5 3.5" />
		</svg>
	);
}

function MailIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-ink-400 pointer-events-none size-4"
		>
			<rect x="2" y="3.5" width="12" height="9" rx="1.75" />
			<path d="m2.5 4.5 5.5 4 5.5-4" />
		</svg>
	);
}

function AlertIcon(): React.JSX.Element {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-3.5 shrink-0"
		>
			<circle cx="8" cy="8" r="6" />
			<path d="M8 5.25v3.25M8 10.75h.01" />
		</svg>
	);
}

function CopyIcon({ copied }: { copied: boolean }): React.JSX.Element {
	return copied ? (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-brand-ink size-3.5"
		>
			<path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
		</svg>
	) : (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-3.5"
		>
			<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
			<path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
		</svg>
	);
}

/**
 * Contact form in a dialog: optional topic selector, name, email and message.
 * Send opens the visitor's email app with the message ready (`mailto:`).
 */
export function ContactDialog({
	onClose,
	onSend = openMailApp,
}: ContactDialogProps): React.JSX.Element {
	const { locale, t } = useT();
	const [values, setValues] = useState<ContactValues>({
		name: "",
		email: "",
		message: "",
		topic: "",
	});
	const [errors, setErrors] = useState<ContactErrors>({});
	const [sent, setSent] = useState(false);
	const [copied, setCopied] = useState(false);
	const refs = {
		name: useRef<HTMLInputElement>(null),
		email: useRef<HTMLInputElement>(null),
		message: useRef<HTMLTextAreaElement>(null),
	};

	function change(field: (typeof FIELDS)[number], value: string) {
		const next = { ...values, [field]: value };
		setValues(next);
		setSent(false);
		if (errors[field]) {
			const fixed = validateContact(next, locale)[field];
			setErrors((current) => ({ ...current, [field]: fixed }));
		}
	}

	function toggleTopic(label: string) {
		setSent(false);
		setValues((current) => ({
			...current,
			topic: current.topic === label ? "" : label,
		}));
	}

	function submit(event: React.FormEvent) {
		event.preventDefault();
		const found = validateContact(values, locale);
		setErrors(found);
		const firstInvalid = FIELDS.find((field) => found[field]);
		if (firstInvalid) {
			refs[firstInvalid].current?.focus();
			return;
		}
		onSend(contactMailto(values, locale));
		setSent(true);
	}

	function copyEmail() {
		void navigator.clipboard?.writeText(SITE.email).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function field(
		name: (typeof FIELDS)[number],
		label: string,
		control: React.JSX.Element,
		extraLabel?: React.ReactNode
	) {
		const error = errors[name];
		return (
			<div className={name === "message" ? "sm:col-span-2" : undefined}>
				<div className="flex items-baseline justify-between gap-2">
					<span className="inline-flex items-baseline gap-1">
						<label
							htmlFor={`contact-${name}`}
							className="text-body-sm text-ink-800 font-medium"
						>
							{label}
						</label>
						<span aria-hidden="true" className="text-brand-ink text-body-sm">
							*
						</span>
					</span>
					{extraLabel}
				</div>
				<div className="mt-1.5">{control}</div>
				{error && (
					<p
						id={`contact-${name}-error`}
						role="alert"
						className="text-body-sm mt-1.5 inline-flex items-center gap-1.5 font-medium text-orange-800"
					>
						<AlertIcon />
						{error}
					</p>
				)}
			</div>
		);
	}

	const shared = (name: (typeof FIELDS)[number], extraClass?: string) => ({
		id: `contact-${name}`,
		name,
		required: true,
		value: values[name],
		onChange: (
			event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
		) => change(name, event.target.value),
		"aria-invalid": errors[name] ? (true as const) : undefined,
		"aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
		className: cn(
			inputBaseClass,
			extraClass,
			errors[name] &&
				"border-orange-700 bg-orange-50/40 focus-visible:border-orange-700 focus-visible:ring-orange-700/20"
		),
	});

	return (
		<Modal label={t("contact.dialogLabel")} onClose={onClose}>
			<div className="animate-rise-quick bg-canvas border-ink-200/80 text-text-primary relative max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl shadow-black/25 sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="font-display text-h3 max-[720px]:text-h4">
							{t("contact.title")}
						</h2>
						<p className="text-body-sm text-text-secondary mt-2 flex flex-wrap items-center gap-2">
							<span>{t("contact.writeTo")}</span>
							<a
								href={`mailto:${SITE.email}`}
								className="text-text-primary hover:text-brand-ink font-mono font-medium underline underline-offset-4 transition-colors"
							>
								{SITE.email}
							</a>
							<button
								type="button"
								onClick={copyEmail}
								className="focus-visible:outline-brand text-caption border-ink-200 bg-surface hover:border-ink-300 hover:bg-ink-100 focus-visible:bg-ink-100 text-ink-800 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
							>
								<CopyIcon copied={copied} />
								{copied ? t("contact.copied") : t("contact.copy")}
							</button>
						</p>
					</div>
					<button
						type="button"
						aria-label={t("contact.close")}
						onClick={onClose}
						className="focus-visible:outline-brand border-ink-200 bg-surface text-ink-700 hover:border-ink-300 hover:bg-ink-100 focus-visible:bg-ink-100 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
					>
						<CloseIcon />
					</button>
				</div>

				<form
					onSubmit={submit}
					noValidate
					className="border-ink-100 mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2"
				>
					<fieldset className="sm:col-span-2">
						<legend className="text-caption text-text-secondary font-mono font-medium tracking-[0.06em] uppercase">
							{t("contact.topic")}
						</legend>
						<div className="mt-2.5 flex flex-wrap gap-2">
							{TOPIC_KEYS.map((key) => {
								const label = t(key);
								const active = values.topic === label;
								return (
									<button
										key={key}
										type="button"
										aria-pressed={active}
										onClick={() => toggleTopic(label)}
										className={cn(
											"focus-visible:outline-brand text-body-sm cursor-pointer rounded-full border px-3.5 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
											active
												? "border-ink-900 bg-ink-900 text-white"
												: "border-ink-200 bg-surface text-ink-700 hover:border-ink-400 hover:bg-ink-100/70"
										)}
									>
										{label}
									</button>
								);
							})}
						</div>
					</fieldset>

					{field(
						"name",
						t("contact.name"),
						<div className="relative">
							<span className="absolute inset-y-0 left-3.5 flex items-center">
								<UserIcon />
							</span>
							<input
								{...shared("name", "pr-4 pl-10")}
								ref={refs.name}
								type="text"
								autoComplete="name"
								placeholder={t("contact.namePlaceholder")}
								data-autofocus=""
							/>
						</div>
					)}
					{field(
						"email",
						t("contact.email"),
						<div className="relative">
							<span className="absolute inset-y-0 left-3.5 flex items-center">
								<MailIcon />
							</span>
							<input
								{...shared("email", "pr-4 pl-10")}
								ref={refs.email}
								type="email"
								autoComplete="email"
								placeholder={t("contact.emailPlaceholder")}
							/>
						</div>
					)}
					{field(
						"message",
						t("contact.message"),
						<textarea
							{...shared("message", "resize-none px-4")}
							ref={refs.message}
							rows={4}
							maxLength={MAX_MESSAGE}
							placeholder={t("contact.messagePlaceholder")}
						/>,
						<span className="text-caption text-ink-500 font-mono tabular-nums">
							{t("contact.charCount", {
								count: values.message.length,
								max: MAX_MESSAGE,
							})}
						</span>
					)}

					<div className="mt-1 flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
						<SocialChips links={SITE.social} />
						<Button type="submit" size="lg" arrow>
							{t("contact.send")}
						</Button>
					</div>

					<p
						role="status"
						aria-live="polite"
						className="text-body-sm text-text-secondary sm:col-span-2"
					>
						{sent ? t("contact.sent", { email: SITE.email }) : ""}
					</p>
				</form>
			</div>
		</Modal>
	);
}
