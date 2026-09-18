import type { PopoverCloseReason } from './context';
import {
	focusWithModality,
	resolveCloseInteractionModality
} from '../../primitives/input-modality';

export function clearTriggerFocusState(trigger: HTMLElement) {
	delete trigger.dataset.focused;
	delete trigger.dataset.focusVisible;
}

// Per APG/React Aria/Radix, focus returns to the trigger only for keyboard or
// imperative closes. User-directed dismissals ('outside-press', 'focus-out',
// 'scroll') must leave focus where the user just put it (e.g. the caret in an
// outside input, or the element tabbed to).
const TRIGGER_REFOCUS_CLOSE_REASONS: ReadonlySet<PopoverCloseReason> = new Set([
	'escape-key',
	'close-press',
	'imperative-action'
]);

export function shouldRefocusTriggerOnClose(reason: PopoverCloseReason): boolean {
	return TRIGGER_REFOCUS_CLOSE_REASONS.has(reason);
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

export function applyTriggerCloseFocusState(
	trigger: HTMLElement,
	reason: PopoverCloseReason,
	event?: Event
) {
	const closeModality = resolveCloseInteractionModality(reason, event);
	if (shouldRefocusTriggerOnClose(reason) || (reason === 'outside-press' && focusFellToBody())) {
		focusWithModality(trigger, closeModality);
	}
	// The attributes say what is true, and nothing else: a trigger that does not hold the
	// focus shows no focus state. Written by hand, they would only clear on a blur of the
	// trigger, and a trigger that never took the focus never blurs.
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
