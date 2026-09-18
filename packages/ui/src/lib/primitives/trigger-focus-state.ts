import { focusWithModality, resolveCloseInteractionModality } from './input-modality.js';

/**
 * The focus state of a trigger after its floating panel closes.
 *
 * Shared by Popover and Menu, whose close reasons differ only in which of them return the
 * focus to the trigger. The rule for the attributes is the same for both: the trigger shows
 * `data-focused` and `data-focus-visible` only while it holds the focus. Written by hand for
 * a trigger that does not hold it, they would clear only on a blur of the trigger — and a
 * trigger that never took the focus never blurs.
 */

export function clearTriggerFocusState(trigger: HTMLElement) {
	delete trigger.dataset.focused;
	delete trigger.dataset.focusVisible;
}

/**
 * Whether the last interaction left the focus on nothing: the body, or no element at all.
 *
 * An outside press on a heading, on a paragraph or on the background moves the focus to the
 * body, and a keyboard user then has nowhere to continue from — Space and Enter open nothing.
 * Base UI and React Aria both return the focus to the trigger in that case, and only in that
 * case: a press on a button or an input keeps the focus the user just gave it.
 */
export function focusFellToBody(): boolean {
	const active = document.activeElement;
	return !active || active === document.body || active === document.documentElement;
}

export type ApplyTriggerCloseFocusStateOptions = {
	/**
	 * Whether the close reason returns the focus to the trigger on its own. An outside press
	 * never does, and it is handled here: the focus returns only when the press left it on
	 * nothing.
	 */
	refocus: boolean;
};

export function applyTriggerCloseFocusState(
	trigger: HTMLElement,
	reason: string,
	event: Event | undefined,
	options: ApplyTriggerCloseFocusStateOptions
) {
	const closeModality = resolveCloseInteractionModality(reason, event);
	if (options.refocus || (reason === 'outside-press' && focusFellToBody())) {
		focusWithModality(trigger, closeModality);
	}
	const holdsFocus = document.activeElement === trigger;
	if (holdsFocus) {
		trigger.dataset.focused = 'true';
	} else {
		delete trigger.dataset.focused;
	}
	if (holdsFocus && closeModality === 'keyboard') {
		trigger.dataset.focusVisible = 'true';
	} else {
		delete trigger.dataset.focusVisible;
	}
}

export function addTriggerBlurCleanup(trigger: HTMLElement, once = false) {
	const handleBlur = () => {
		clearTriggerFocusState(trigger);
		if (once) {
			trigger.removeEventListener('blur', handleBlur);
		}
	};

	trigger.addEventListener('blur', handleBlur);

	return () => {
		trigger.removeEventListener('blur', handleBlur);
	};
}
