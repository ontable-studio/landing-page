/** What counts as media: a picture, a drawing, a video or a canvas, or anything inside one. */
const MEDIA = "img, picture, svg, video, canvas, object, embed";

/**
 * Stops a picture from being picked up and dragged away with the pointer, whether
 * as a ghost image or as a link into another window. That includes a link or a
 * button that wraps a picture, such as a project card. The CSS in main.css does it
 * for Chrome, Edge and Safari; Firefox only listens to this. A plain text link or
 * selected text can still be dragged. Returns what undoes it.
 */
export function preventMediaDrag(target: Document = document): () => void {
	const onDragStart = (event: DragEvent) => {
		const source = event.target;
		if (!(source instanceof Element)) return;
		if (source.closest(MEDIA) || source.querySelector(MEDIA)) {
			event.preventDefault();
		}
	};
	target.addEventListener("dragstart", onDragStart);
	return () => target.removeEventListener("dragstart", onDragStart);
}
