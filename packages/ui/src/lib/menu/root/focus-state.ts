import type { MenuInternalCloseReason } from './context';
import {
	applyTriggerCloseFocusState as applyTriggerCloseFocusStateShared,
	addTriggerBlurCleanup,
	clearTriggerFocusState
} from '../../primitives/trigger-focus-state';

export { addTriggerBlurCleanup, clearTriggerFocusState };

// Every reason the menu schedules returns the focus to the trigger, except an outside press:
// there the shared primitive returns it only when the press left the focus on nothing.
// 'submenu-back' (ArrowLeft) styles the submenu trigger exactly like an Escape.
export function applyTriggerCloseFocusState(
	trigger: HTMLElement,
	reason: MenuInternalCloseReason,
	event?: Event
) {
	applyTriggerCloseFocusStateShared(trigger, reason, event, {
		refocus: reason !== 'outside-press'
	});
}
