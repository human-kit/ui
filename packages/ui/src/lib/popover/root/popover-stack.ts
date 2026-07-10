/**
 * Popover layer helpers, backed by the unified layer stack. A popover is only
 * "topmost" when no other dismissable layer (another popover, a menu, or a
 * dialog opened after it) sits above it — so dismissing a nested layer never
 * also closes its ancestors, across component kinds.
 */

import { pushLayer, removeLayer, isTopmostLayer } from '../../primitives/layer-stack';

export function pushPopoverLayer(): symbol {
	return pushLayer('popover');
}

export function removePopoverLayer(id: symbol): void {
	removeLayer(id);
}

export function isTopmostPopover(id: symbol): boolean {
	return isTopmostLayer(id);
}
