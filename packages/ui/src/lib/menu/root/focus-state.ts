import type { MenuInternalCloseReason } from './context';
import {
	focusWithModality,
	resolveCloseInteractionModality
} from '../../primitives/input-modality';
import { focusFellToBody } from '../../popover/root/focus-state';

export function clearTriggerFocusState(trigger: HTMLElement) {
	delete trigger.dataset.focused;
	delete trigger.dataset.focusVisible;
}

export function applyTriggerCloseFocusState(
	trigger: HTMLElement,
	reason: MenuInternalCloseReason,
	event?: Event
) {
	const closeModality = resolveCloseInteractionModality(reason, event);
	// An outside press on nothing focusable leaves the focus on the body, and a keyboard user
	// has nowhere to continue from. The focus goes back to the trigger then, as in Base UI and
	// React Aria; a press on a focusable element keeps the focus the user gave it.
	if (reason !== 'outside-press' || focusFellToBody()) {
		focusWithModality(trigger, closeModality);
	}
	// The attributes say what is true: a trigger that does not hold the focus shows no focus
	// state. 'submenu-back' (ArrowLeft) styles the submenu trigger exactly like an Escape.
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
