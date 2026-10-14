import { SITE } from "../../../common/constants";

export interface ContactValues {
	name: string;
	email: string;
	message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with the form, by field. Empty when it can be sent. */
export function validateContact(values: ContactValues): ContactErrors {
	const errors: ContactErrors = {};
	if (!values.name.trim()) errors.name = "Enter your name";
	const email = values.email.trim();
	if (!email) errors.email = "Enter your email address";
	else if (!EMAIL.test(email)) errors.email = "Enter a valid email address";
	if (!values.message.trim()) errors.message = "Write a message";
	return errors;
}

/**
 * A `mailto:` link to the studio with the visitor's message ready to send. The site has
 * no server, so this is how the form sends: the visitor's email app opens with this.
 * Percent-encoded (not `+`) because mail clients read `+` literally.
 */
export function contactMailto(values: ContactValues): string {
	const name = values.name.trim();
	const email = values.email.trim();
	const subject = `Message from ${name}`;
	const body = `${values.message.trim()}\n\n${name} (${email})`;
	return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
