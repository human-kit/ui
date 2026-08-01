/**
 * Dialog stack helpers, backed by the unified layer stack so a dialog is only
 * "topmost" when NO other dismissable layer (popover/menu, of any component)
 * is stacked above it. `level` counts open dialogs only, for z-index math.
 */

import {
	pushLayer,
	removeLayer,
	isTopmostLayer,
	getLayerCount,
	getLayerKindIndex,
	subscribeLayerStack
} from '../../primitives/layer-stack';

/**
 * The z-index scale lives in `primitives/layer-stack.ts` — it is shared by every
 * layer kind (drawers included), not dialog-specific. Re-exported here so the
 * existing Dialog call sites keep their import path.
 */
export {
	getOverlayZIndex,
	getContentZIndex,
	getFloatingLayerZIndex,
	getFloatingLayerOverlayZIndex
} from '../../primitives/layer-stack';

/**
 * Register a dialog when it opens.
 * Returns the dialog ID and level for z-index calculation. The level is the dialog's
 * CURRENT position — re-read it via `getDialogLevel` (see `subscribeDialogStack`) as
 * siblings open/close, since a level frozen at push time can end up duplicated once
 * an earlier sibling closes and reopens.
 */
export function pushDialog(_close?: () => void): { id: symbol; level: number } {
	const id = pushLayer('dialog');
	return { id, level: getDialogLevel(id) };
}

/**
 * CURRENT index of this dialog among the open dialogs (0-based, in stack order).
 * Returns 0 when the dialog is not in the stack.
 */
export function getDialogLevel(id: symbol): number {
	const index = getLayerKindIndex(id);
	return index === -1 ? 0 : index;
}

/**
 * Notifies whenever the layer stack changes, so an open dialog can re-derive its
 * level (and z-index) instead of keeping the value frozen at push time.
 * Returns an unsubscribe function.
 */
export function subscribeDialogStack(listener: () => void): () => void {
	return subscribeLayerStack(listener);
}

/**
 * Unregister a dialog when it closes.
 */
export function popDialog(id: symbol): void {
	removeLayer(id);
}

/**
 * Check if this dialog is the topmost dismissable layer (should handle events).
 * A popover or menu opened inside the dialog sits above it in the unified stack,
 * so Escape/outside-press dismiss that layer first, not the dialog.
 */
export function isTopmostDialog(id: symbol): boolean {
	return isTopmostLayer(id);
}

/**
 * Get the number of open dialogs.
 */
export function getDialogCount(): number {
	return getLayerCount('dialog');
}
