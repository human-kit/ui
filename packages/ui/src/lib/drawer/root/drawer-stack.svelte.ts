/**
 * Global registry of open drawers, in open order.
 *
 * Separate from `primitives/layer-stack.ts` on purpose: that one answers "who owns
 * the next Escape, and at what z-index", which drawers share with dialogs. This one
 * answers questions only drawers ask — how deep am I in the stack, how tall is the
 * frontmost one, how far has it been dragged — so a drawer behind another can shrink
 * back, and the app behind all of them can indent.
 */

import { untrack } from 'svelte';

export type DrawerStackEntry = {
	id: symbol;
	/** Panel extent along its own axis, in px. */
	extent: number;
	/**
	 * How present the drawer is, 0–1: 1 at rest, falling toward 0 as it is dragged
	 * away. Drives the indent so the app comes back as the drawer leaves, rather
	 * than snapping at the moment it closes.
	 */
	presence: number;
	/** Whether the drawer is being dragged right now. */
	swiping: boolean;
	/**
	 * Whether the drawer is playing its exit animation.
	 *
	 * A closing drawer stays registered until it unmounts, because it is still on
	 * screen — but it should stop counting as "on top of" the one behind it the
	 * moment it starts leaving. Waiting for the unmount made the drawer underneath
	 * sit still through the whole exit and only then begin its own animation, which
	 * read as the stack unwinding in slow motion instead of the two moving together.
	 */
	exiting: boolean;
};

const entries = $state<DrawerStackEntry[]>([]);

/** Registers an opened drawer and returns its identity. */
export function registerDrawer(): symbol {
	const id = Symbol('drawer');
	untrack(() => {
		entries.push({ id, extent: 0, presence: 1, swiping: false, exiting: false });
	});
	return id;
}

export function unregisterDrawer(id: symbol): void {
	untrack(() => {
		const index = entries.findIndex((entry) => entry.id === id);
		if (index !== -1) entries.splice(index, 1);
	});
}

/**
 * Updates a drawer's measurements.
 *
 * Reads are untracked because callers patch from inside an `$effect` that also
 * reads the stack; subscribing to the array here would make that effect retrigger
 * itself forever.
 */
export function updateDrawer(id: symbol, patch: Partial<Omit<DrawerStackEntry, 'id'>>): void {
	untrack(() => {
		const entry = entries.find((candidate) => candidate.id === id);
		if (!entry) return;
		if (patch.extent !== undefined && patch.extent !== entry.extent) entry.extent = patch.extent;
		if (patch.presence !== undefined && patch.presence !== entry.presence) {
			entry.presence = patch.presence;
		}
		if (patch.swiping !== undefined && patch.swiping !== entry.swiping) {
			entry.swiping = patch.swiping;
		}
		if (patch.exiting !== undefined && patch.exiting !== entry.exiting) {
			entry.exiting = patch.exiting;
		}
	});
}

/** Index in open order, or `-1` when the drawer is not registered. */
export function getDrawerIndex(id: symbol): number {
	return entries.findIndex((entry) => entry.id === id);
}

/**
 * Reactive view of the stack. A getter object rather than exported values so
 * consumers read through the proxy and stay subscribed.
 */
export const drawerStack = {
	get entries(): readonly DrawerStackEntry[] {
		return entries;
	},
	get count(): number {
		return entries.length;
	},
	/** Extent of the drawer on top of the stack, in px. */
	get frontmostExtent(): number {
		return entries.length > 0 ? entries[entries.length - 1].extent : 0;
	},
	/**
	 * How far the app behind should be indented, 0–1. Takes the maximum rather than
	 * summing so a stack of drawers indents exactly as much as one does.
	 */
	get indentProgress(): number {
		let progress = 0;
		for (const entry of entries) {
			if (entry.presence > progress) progress = entry.presence;
		}
		return progress;
	},
	/** Whether any drawer is mid-drag, used to suspend the indent transition. */
	get isSwiping(): boolean {
		return entries.some((entry) => entry.swiping);
	}
};

/**
 * Whether a drawer opened after `id` is currently open.
 *
 * Exiting drawers do not count: a drawer on its way out should release the one
 * behind it immediately, so both animate at once rather than in sequence.
 */
export function hasDrawerAbove(id: symbol): boolean {
	const index = getDrawerIndex(id);
	if (index === -1) return false;
	return entries.slice(index + 1).some((entry) => !entry.exiting);
}

/** Whether a drawer opened after `id` is being dragged. */
export function hasSwipingDrawerAbove(id: symbol): boolean {
	const index = getDrawerIndex(id);
	if (index === -1) return false;
	return entries.slice(index + 1).some((entry) => entry.swiping && !entry.exiting);
}

/** Distance from the front of the stack — 0 is the frontmost drawer. */
export function getDepthFromFront(id: symbol): number {
	const index = getDrawerIndex(id);
	if (index === -1) return 0;
	return entries.slice(index + 1).filter((entry) => !entry.exiting).length;
}
