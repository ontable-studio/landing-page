import { afterEach, describe, expect, it } from "vitest";
import { preventMediaDrag } from "./preventMediaDrag";

let stop: (() => void) | undefined;

afterEach(() => {
	stop?.();
	stop = undefined;
	document.body.replaceChildren();
});

/** Starts a drag on `element`; true if something let it go ahead. */
const drag = (element: Element) => {
	const event = new Event("dragstart", { bubbles: true, cancelable: true });
	element.dispatchEvent(event);
	return !event.defaultPrevented;
};

describe("preventMediaDrag", () => {
	it("stops a picture from being dragged", () => {
		stop = preventMediaDrag();
		const img = document.createElement("img");
		document.body.append(img);
		expect(drag(img)).toBe(false);
	});

	it("stops a drawing, a video and a canvas, and anything inside one", () => {
		stop = preventMediaDrag();
		document.body.innerHTML =
			'<svg><path id="p"/></svg><video id="v"></video><canvas id="c"></canvas><picture><img id="i"></picture>';
		for (const selector of ["#p", "#v", "#c", "#i", "picture"]) {
			expect(drag(document.querySelector(selector)!), selector).toBe(false);
		}
	});

	it("stops a link or a button that wraps a picture, such as a project card", () => {
		stop = preventMediaDrag();
		document.body.innerHTML =
			'<a id="card" href="/projects/x"><div><img alt=""></div></a><button id="thumb"><img alt=""></button>';
		expect(drag(document.querySelector("#card")!)).toBe(false);
		expect(drag(document.querySelector("#thumb")!)).toBe(false);
	});

	it("leaves everything else to be dragged, such as a text link or selected text", () => {
		stop = preventMediaDrag();
		document.body.innerHTML = '<a id="a" href="#x">link</a><p id="t">text</p>';
		expect(drag(document.querySelector("#a")!)).toBe(true);
		expect(drag(document.querySelector("#t")!)).toBe(true);
	});

	it("stops watching once it is undone", () => {
		stop = preventMediaDrag();
		stop();
		stop = undefined;
		const img = document.createElement("img");
		document.body.append(img);
		expect(drag(img)).toBe(true);
	});

	it("does not choke on a drag that starts on the document itself", () => {
		stop = preventMediaDrag();
		const event = new Event("dragstart", { bubbles: true, cancelable: true });
		expect(() => document.dispatchEvent(event)).not.toThrow();
		expect(event.defaultPrevented).toBe(false);
	});
});
