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
 *
 * It also owns the z-index math for every layer, so modal surfaces (dialogs,
 * drawers) and floating ones (popovers, menus) are laid out against a single
 * scale. The math used to live in `dialog/root/dialog-stack.ts`, which meant
 * Menu and Popover imported from Dialog just to place themselves.
 */

/**
 * `dialog` covers every MODAL surface — dialogs and drawers alike. They share the
 * kind on purpose: the level that drives their z-index counts layers per kind, so
 * a separate `drawer` kind would mint a drawer opened over a dialog the very same
 * level, and the two would collide at the same z-index.
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

/* ── z-index scale ──────────────────────────────────────────────────── */

/** Base z-index for the first modal layer. Each nested one climbs by the increment. */
const BASE_Z_INDEX = 9990;
const Z_INDEX_INCREMENT = 10;

/** Z-index for a modal layer's backdrop at `level` (its index among open modals). */
export function getOverlayZIndex(level: number): number {
	return BASE_Z_INDEX + level * Z_INDEX_INCREMENT;
}

/** Z-index for a modal layer's panel — one above its own backdrop. */
export function getContentZIndex(level: number): number {
	return BASE_Z_INDEX + level * Z_INDEX_INCREMENT + 1;
}

/**
 * Z-index a floating layer (popover/menu/calendar) should use so it renders ABOVE
 * the topmost open modal — or above page content when none is open. Without this,
 * a popover opened inside a (nested) dialog kept its fixed z-index and rendered
 * behind the dialog, because each nested modal's panel sits at a higher z-index
 * than the popover's old constant. Resolves to 9999 with no modals open (the prior
 * fixed value), and climbs past the stack as modals nest.
 */
export function getFloatingLayerZIndex(): number {
	return BASE_Z_INDEX + getLayerCount('dialog') * Z_INDEX_INCREMENT + 9;
}

/**
 * Z-index for a floating layer's backdrop — one below its content (mirrors the
 * modal overlay/content pairing).
 */
export function getFloatingLayerOverlayZIndex(): number {
	return getFloatingLayerZIndex() - 1;
}
