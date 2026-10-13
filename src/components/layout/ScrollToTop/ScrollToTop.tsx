import { useEffect } from "react";
import { useLocation } from "react-router";

/** Returns to the top of the page on every navigation to a new path (not on hash jumps). */
export function ScrollToTop(): null {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}
