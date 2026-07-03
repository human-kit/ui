import { browser } from '../internal/environment';

/**
 * Blurs the currently focused element when it lives inside a floating container
 * that is about to be hidden (`aria-hidden` + `inert`).
 *
 * Browsers reject `aria-hidden` on an ancestor of the focused element
 * ("Blocked aria-hidden on an element because its descendant retained focus"),
 * so floating surfaces (popover, menu) must release a focused descendant before
 * they mark themselves hidden on close.
 *
 * Focus already sitting on the trigger (or inside it) is left untouched — that is
 * the intended landing spot after the surface closes. Focus that has already moved
 * outside the container is likewise ignored.
 *
 * @param container The floating surface being hidden.
 * @param trigger The element that opened the surface, if any.
 */
export function releaseFocusedDescendant(
	container: HTMLElement | null | undefined,
	trigger: HTMLElement | null | undefined
): void {
	if (!browser || !container) return;

	const activeElement = document.activeElement;
	if (!(activeElement instanceof HTMLElement)) return;

	if (trigger && (activeElement === trigger || trigger.contains(activeElement))) return;
	if (activeElement !== container && !container.contains(activeElement)) return;

	activeElement.blur();
}
