import { useEffect } from "react";

/** Sets the browser tab title for as long as the calling page is shown. */
export function useDocumentTitle(title: string): void {
	useEffect(() => {
		document.title = title;
	}, [title]);
}
