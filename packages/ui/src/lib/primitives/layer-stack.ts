/**
 * Unified global stack of dismissable layers (dialogs, popovers, menus).
 *
 * Every floating surface that can be dismissed with Escape or an outside press
 * registers here in open order. Only the topmost layer of the WHOLE stack may
 * respond to a dismiss interaction, regardless of kind — so pressing Escape with
 * a popover open inside a dialog closes just the popover, and the next Escape
 * closes the dialog. Kind-specific stacks (dialog/popover/menu) are thin views
 * over this shared stack; keeping them separate was the root cause of a single
 * Escape or outside press dismissing a dialog together with the popover/menu
 * opened inside it.
 */

export type LayerKind = 'dialog' | 'popover' | 'menu';

type LayerEntry = { id: symbol; kind: LayerKind };

const layerStack: LayerEntry[] = [];

/** Register a layer when it opens. Returns its identity for later checks. */
export function pushLayer(kind: LayerKind): symbol {
	const id = Symbol(`${kind}-layer`);
	layerStack.push({ id, kind });
	return id;
}

/** Unregister a layer when it closes. */
export function removeLayer(id: symbol): void {
	const index = layerStack.findIndex((entry) => entry.id === id);
	if (index !== -1) {
		layerStack.splice(index, 1);
	}
}

/** Whether this layer is the topmost of the whole stack (any kind). */
export function isTopmostLayer(id: symbol): boolean {
	if (layerStack.length === 0) return false;
	return layerStack[layerStack.length - 1].id === id;
}

/** Number of open layers, optionally filtered by kind. */
export function getLayerCount(kind?: LayerKind): number {
	if (kind === undefined) return layerStack.length;
	let count = 0;
	for (const entry of layerStack) {
		if (entry.kind === kind) count += 1;
	}
	return count;
}
