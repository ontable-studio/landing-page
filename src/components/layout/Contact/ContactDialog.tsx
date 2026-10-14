import { useRef, useState } from "react";
import { SITE } from "../../../common/constants";
import { useT } from "../../../i18n";
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

const inputClass =
	"focus-visible:outline-brand border-surface-border text-body w-full rounded-2xl border bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2";

function openMailApp(url: string) {
	window.location.href = url;
}

/**
 * Contact form in a dialog: name, email and message. The site has no server, so Send
 * opens the visitor's email app with the message ready (`mailto:`), and the dialog
 * says so. The studio's email and social links sit beside it.
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
		control: React.JSX.Element
	) {
		const error = errors[name];
		return (
			<div className={name === "message" ? "sm:col-span-2" : undefined}>
				<label htmlFor={`contact-${name}`} className="text-body-sm font-medium">
					{label}
				</label>
				<div className="mt-1">{control}</div>
				{error && (
					<p
						id={`contact-${name}-error`}
						className="text-body-sm mt-1 text-orange-800"
					>
						{error}
					</p>
				)}
			</div>
		);
	}

	const shared = (name: (typeof FIELDS)[number]) => ({
		id: `contact-${name}`,
		name,
		value: values[name],
		onChange: (
			event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
		) => change(name, event.target.value),
		"aria-invalid": errors[name] ? (true as const) : undefined,
		"aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
		className: cn(inputClass, errors[name] && "border-orange-700"),
	});

	return (
		<Modal label={t("contact.dialogLabel")} onClose={onClose}>
			<div className="bg-canvas text-text-primary relative max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<h2 className="font-display text-h3 max-[720px]:text-h4">
						{t("contact.title")}
					</h2>
					<button
						type="button"
						aria-label={t("contact.close")}
						onClick={onClose}
						className="focus-visible:outline-brand hover:bg-surface focus-visible:bg-surface grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-2xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
					>
						<span aria-hidden="true">×</span>
					</button>
				</div>

				<p className="text-body text-text-secondary mt-2 flex flex-wrap items-center gap-x-2">
					<span>{t("contact.writeTo")}</span>
					<a
						href={`mailto:${SITE.email}`}
						className="text-text-primary font-medium underline"
					>
						{SITE.email}
					</a>
					<button
						type="button"
						onClick={copyEmail}
						className="focus-visible:outline-brand text-body-sm border-surface-border hover:bg-surface focus-visible:bg-surface cursor-pointer rounded-full border px-3 py-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
					>
						{copied ? t("contact.copied") : t("contact.copy")}
					</button>
				</p>

				<form
					onSubmit={submit}
					noValidate
					className="mt-6 grid gap-4 sm:grid-cols-2"
				>
					{field(
						"name",
						t("contact.name"),
						<input
							{...shared("name")}
							ref={refs.name}
							type="text"
							autoComplete="name"
							data-autofocus=""
						/>
					)}
					{field(
						"email",
						t("contact.email"),
						<input
							{...shared("email")}
							ref={refs.email}
							type="email"
							autoComplete="email"
						/>
					)}
					{field(
						"message",
						t("contact.message"),
						<textarea
							{...shared("message")}
							ref={refs.message}
							rows={4}
							maxLength={1500}
						/>
					)}

					<div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
						<SocialChips links={SITE.social} />
						<Button type="submit" size="lg">
							{t("contact.send")}
						</Button>
					</div>

					<p
						role="status"
						className="text-body-sm text-text-secondary sm:col-span-2"
					>
						{sent ? t("contact.sent", { email: SITE.email }) : ""}
					</p>
				</form>
			</div>
		</Modal>
	);
}
