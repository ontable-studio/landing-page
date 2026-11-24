import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Globals are off, so Testing Library cannot register its own cleanup.
afterEach(() => cleanup());

// jsdom does not implement scrolling; ScrollToTop calls it on every navigation.
window.scrollTo = () => {};

// jsdom does not implement IntersectionObserver; motion's whileInView uses it.
if (typeof globalThis.IntersectionObserver === "undefined") {
	class MockIntersectionObserver implements IntersectionObserver {
		readonly root: Element | Document | null = null;
		readonly rootMargin = "0px";
		readonly scrollMargin = "0px";
		readonly thresholds: ReadonlyArray<number> = [0];
		disconnect(): void {}
		observe(): void {}
		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}
		unobserve(): void {}
	}
	globalThis.IntersectionObserver = MockIntersectionObserver;
}
