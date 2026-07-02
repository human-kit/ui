/**
 * Global dialog stack for managing nested dialogs.
 * Only the topmost dialog should respond to Escape and click-outside events.
 */

type DialogEntry = {
	id: symbol;
	close: () => void;
	level: number;
};

const dialogStack: DialogEntry[] = [];

/**
 * Base z-index for dialogs. Each nested dialog increments by 10.
 */
const BASE_Z_INDEX = 9990;
const Z_INDEX_INCREMENT = 10;

/**
 * Register a dialog when it opens.
 * Returns the dialog ID and level for z-index calculation.
 */
export function pushDialog(close: () => void): { id: symbol; level: number } {
	const id = Symbol('dialog');
	const level = dialogStack.length;
	dialogStack.push({ id, close, level });
	return { id, level };
}

/**
 * Unregister a dialog when it closes.
 */
export function popDialog(id: symbol): void {
	const index = dialogStack.findIndex((entry) => entry.id === id);
	if (index !== -1) {
		dialogStack.splice(index, 1);
	}
}

/**
 * Check if this dialog is the topmost (should handle events).
 */
export function isTopmostDialog(id: symbol): boolean {
	if (dialogStack.length === 0) return false;
	return dialogStack[dialogStack.length - 1].id === id;
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
	return dialogStack.length;
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
	return BASE_Z_INDEX + dialogStack.length * Z_INDEX_INCREMENT + 9;
}

/**
 * Z-index for a floating layer's backdrop — one below its content (mirrors the
 * dialog overlay/content pairing).
 */
export function getFloatingLayerOverlayZIndex(): number {
	return getFloatingLayerZIndex() - 1;
}
