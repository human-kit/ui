import type { PopoverCloseReason } from './context';
import {
	applyTriggerCloseFocusState as applyTriggerCloseFocusStateShared,
	addTriggerBlurCleanup,
	clearTriggerFocusState,
	focusFellToBody
} from '../../primitives/trigger-focus-state';

export { addTriggerBlurCleanup, clearTriggerFocusState, focusFellToBody };

// Per APG/React Aria/Radix, focus returns to the trigger only for keyboard or
// imperative closes. User-directed dismissals ('outside-press', 'focus-out',
// 'scroll') must leave focus where the user just put it (e.g. the caret in an
// outside input, or the element tabbed to). The one exception, an outside press
// that left the focus on nothing, lives in the shared primitive.
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
	applyTriggerCloseFocusStateShared(trigger, reason, event, {
		refocus: shouldRefocusTriggerOnClose(reason)
	});
}
