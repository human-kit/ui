/**
 * Menu layer helpers, backed by the unified layer stack. A menu (root or
 * submenu) is only "topmost" when no other dismissable layer — a deeper
 * submenu, a popover, or a dialog opened after it — sits above it.
 */

import { pushLayer, removeLayer, isTopmostLayer } from '../../primitives/layer-stack';

export function pushMenuLayer(): symbol {
	return pushLayer('menu');
}

export function removeMenuLayer(id: symbol): void {
	removeLayer(id);
}

export function isTopmostMenu(id: symbol): boolean {
	return isTopmostLayer(id);
}
