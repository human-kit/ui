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

export function applyTriggerCloseFocusState(
	trigger: HTMLElement,
	reason: PopoverCloseReason,
	event?: Event
) {
	const closeModality = resolveCloseInteractionModality(reason, event);
	if (shouldRefocusTriggerOnClose(reason)) {
		focusWithModality(trigger, closeModality);
	}
	if (reason === 'outside-press' || reason === 'escape-key') {
		trigger.dataset.focused = 'true';
	} else {
		delete trigger.dataset.focused;
	}
	if (closeModality === 'keyboard') {
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
