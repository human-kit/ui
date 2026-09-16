function canElementScrollInDirection(element: HTMLElement, deltaY: number) {
	const isScrollingDown = deltaY > 0;
	const isScrollingUp = deltaY < 0;
	const canScrollDown = element.scrollTop < element.scrollHeight - element.clientHeight;
	const canScrollUp = element.scrollTop > 0;

	return (isScrollingDown && canScrollDown) || (isScrollingUp && canScrollUp);
}

function isScrollableElement(element: HTMLElement) {
	const { overflowY } = getComputedStyle(element);
	return (
		['auto', 'scroll', 'overlay'].includes(overflowY) && element.scrollHeight > element.clientHeight
	);
}

function hasScrollableDescendantForWheel(
	boundary: HTMLElement,
	target: EventTarget | null,
	deltaY: number
) {
	let current =
		target instanceof HTMLElement ? target : target instanceof Node ? target.parentElement : null;

	while (current) {
		if (isScrollableElement(current) && canElementScrollInDirection(current, deltaY)) {
			return true;
		}

		if (current === boundary) {
			break;
		}

		current = current.parentElement;
	}

	return false;
}

/**
 * Keeps a wheel event inside a floating panel.
 *
 * A non-modal popover closes when the page scrolls under it, and a wheel over a list that
 * has reached its end would scroll the page. So the event scrolls the panel, or a scrollable
 * element inside it, while one of them can still move in that direction, and it is consumed
 * otherwise.
 */
export function containWheel(event: WheelEvent, panel: HTMLElement) {
	if (
		hasScrollableDescendantForWheel(panel, event.target, event.deltaY) ||
		(isScrollableElement(panel) && canElementScrollInDirection(panel, event.deltaY))
	) {
		event.stopPropagation();
		return;
	}

	event.preventDefault();
	event.stopPropagation();
}
