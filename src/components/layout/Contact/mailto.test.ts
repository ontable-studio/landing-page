import { describe, expect, it } from "vitest";
import { SITE } from "../../../common/constants";
import { contactMailto, validateContact } from "./mailto";

const values = {
	name: "Alex Rivera",
	email: "alex@example.test",
	message: "We would like a game for our school.\nCan we talk this week?",
};

function parts(url: string) {
	const [scheme, query] = url.split("?");
	const params = Object.fromEntries(
		query.split("&").map((pair) => {
			const [key, value] = pair.split("=");
			return [key, decodeURIComponent(value)];
		})
	);
	return { scheme, ...params } as {
		scheme: string;
		subject: string;
		body: string;
	};
}

describe("contactMailto", () => {
	it("addresses the studio's email", () => {
		expect(contactMailto(values).startsWith(`mailto:${SITE.email}?`)).toBe(
			true
		);
	});

	it("puts the visitor's name in the subject", () => {
		expect(parts(contactMailto(values)).subject).toBe(
			"Message from Alex Rivera"
		);
	});

	it("puts the message first, then who it is from, in the body", () => {
		expect(parts(contactMailto(values)).body).toBe(
			"We would like a game for our school.\nCan we talk this week?\n\nAlex Rivera (alex@example.test)"
		);
	});

	it("encodes spaces and line breaks the way mail clients expect, not as plus signs", () => {
		const url = contactMailto(values);
		expect(url).not.toContain("+");
		expect(url).not.toContain(" ");
		expect(url).toContain("%0A");
		expect(url).toContain("%20");
	});

	it("survives characters that would break a query string", () => {
		const tricky = {
			...values,
			name: "Zoë & Co",
			message: "50% off? #1 +1 = 2",
		};
		const out = parts(contactMailto(tricky));
		expect(out.subject).toBe("Message from Zoë & Co");
		expect(out.body).toContain("50% off? #1 +1 = 2");
	});

	it("trims whitespace around the fields", () => {
		const out = parts(
			contactMailto({ name: "  Alex  ", email: " a@b.co ", message: "  Hi  " })
		);
		expect(out.subject).toBe("Message from Alex");
		expect(out.body).toBe("Hi\n\nAlex (a@b.co)");
	});
});

describe("validateContact", () => {
	it("accepts a complete, well-formed message", () => {
		expect(validateContact(values)).toEqual({});
	});

	it("asks for each missing field by name", () => {
		expect(validateContact({ name: "", email: "", message: "" })).toEqual({
			name: "Enter your name",
			email: "Enter your email address",
			message: "Write a message",
		});
	});

	it("treats whitespace only as empty", () => {
		expect(
			validateContact({ name: "  ", email: values.email, message: " \n " })
		).toEqual({
			name: "Enter your name",
			message: "Write a message",
		});
	});

	it("rejects an email address that is not one", () => {
		for (const email of [
			"alex",
			"alex@",
			"@example.test",
			"alex@example",
			"a b@c.de",
		]) {
			expect(validateContact({ ...values, email }).email, email).toBe(
				"Enter a valid email address"
			);
		}
	});
});
