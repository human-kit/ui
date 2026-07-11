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

/**
 * Listeners notified after every push/remove. Lets an open layer re-derive
 * stack-dependent values (e.g. a dialog's z-index level) as siblings open/close,
 * instead of freezing them at push time.
 */
const stackListeners = new Set<() => void>();

function notifyStackChanged(): void {
	for (const listener of [...stackListeners]) {
		listener();
	}
}

/** Subscribe to stack changes (any push/remove). Returns an unsubscribe function. */
export function subscribeLayerStack(listener: () => void): () => void {
	stackListeners.add(listener);
	return () => {
		stackListeners.delete(listener);
	};
}

/** Register a layer when it opens. Returns its identity for later checks. */
export function pushLayer(kind: LayerKind): symbol {
	const id = Symbol(`${kind}-layer`);
	layerStack.push({ id, kind });
	notifyStackChanged();
	return id;
}

/** Unregister a layer when it closes. */
export function removeLayer(id: symbol): void {
	const index = layerStack.findIndex((entry) => entry.id === id);
	if (index !== -1) {
		layerStack.splice(index, 1);
		notifyStackChanged();
	}
}

/**
 * CURRENT index of a layer among the open layers of its own kind (0-based, in
 * stack order), or -1 when it isn't in the stack. Unlike a level captured at
 * push time, this stays correct when earlier siblings close and reopen.
 */
export function getLayerKindIndex(id: symbol): number {
	const entry = layerStack.find((candidate) => candidate.id === id);
	if (!entry) return -1;
	let index = 0;
	for (const candidate of layerStack) {
		if (candidate.id === id) return index;
		if (candidate.kind === entry.kind) index += 1;
	}
	return -1;
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
