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
 * Base z-index for dialogs. Each nested dialog increments by 10.
 */
const BASE_Z_INDEX = 9990;
const Z_INDEX_INCREMENT = 10;

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
 * Get the z-index for the overlay based on dialog level.
 */
export function getOverlayZIndex(level: number): number {
	return BASE_Z_INDEX + level * Z_INDEX_INCREMENT;
}

/**
 * Get the z-index for the content based on dialog level.
 */
export function getContentZIndex(level: number): number {
	return BASE_Z_INDEX + level * Z_INDEX_INCREMENT + 1;
}

/**
 * Get the number of open dialogs.
 */
export function getDialogCount(): number {
	return getLayerCount('dialog');
}

/**
 * Z-index a floating layer (popover/calendar) should use so it renders ABOVE the
 * topmost open dialog — or above page content when no dialog is open. Without this,
 * a popover opened inside a (nested) dialog kept its fixed z-index and rendered
 * behind the dialog, because each nested dialog's content sits at a higher z-index
 * than the popover's old constant. Resolves to 9999 with no dialogs open (the prior
 * fixed value), and climbs past the dialog stack as dialogs nest.
 */
export function getFloatingLayerZIndex(): number {
	return BASE_Z_INDEX + getLayerCount('dialog') * Z_INDEX_INCREMENT + 9;
}

/**
 * Z-index for a floating layer's backdrop — one below its content (mirrors the
 * dialog overlay/content pairing).
 */
export function getFloatingLayerOverlayZIndex(): number {
	return getFloatingLayerZIndex() - 1;
}
