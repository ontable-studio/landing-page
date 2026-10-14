import { SITE } from "../../../common/constants";
import { translate, type Locale } from "../../../i18n";

export interface ContactValues {
	name: string;
	email: string;
	message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with the form, by field. Empty when it can be sent. */
export function validateContact(
	values: ContactValues,
	locale: Locale = "en"
): ContactErrors {
	const errors: ContactErrors = {};
	if (!values.name.trim())
		errors.name = translate(locale, "contact.error.name");
	const email = values.email.trim();
	if (!email) errors.email = translate(locale, "contact.error.emailMissing");
	else if (!EMAIL.test(email))
		errors.email = translate(locale, "contact.error.emailInvalid");
	if (!values.message.trim())
		errors.message = translate(locale, "contact.error.message");
	return errors;
}

/**
 * A `mailto:` link to the studio with the visitor's message ready to send. The site has
 * no server, so this is how the form sends: the visitor's email app opens with this.
 * Percent-encoded (not `+`) because mail clients read `+` literally.
 */
export function contactMailto(
	values: ContactValues,
	locale: Locale = "en"
): string {
	const name = values.name.trim();
	const email = values.email.trim();
	const subject = translate(locale, "contact.mailSubject", { name });
	const body = `${values.message.trim()}\n\n${name} (${email})`;
	return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
