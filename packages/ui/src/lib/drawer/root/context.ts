import { setContext, getContext } from 'svelte';
import type { DrawerModal, DrawerSide, DrawerCloseReason, DrawerSnapPoint } from './types';

/**
 * Context shared by every Drawer part.
 *
 * Everything a part needs to render itself lives here rather than being threaded
 * through props, so `Drawer.Overlay` can fade in step with a swipe it does not
 * own, and `Drawer.Title` can label a `Drawer.Content` it is nested inside.
 */
export type DrawerContext = {
	/** Whether the drawer is open. */
	readonly isOpen: boolean;
	/** Edge the panel is anchored to. */
	readonly side: DrawerSide;
	/** Focus/scroll behaviour: `true`, `'trap-focus'`, or `false`. */
	readonly modal: DrawerModal;
	/** Whether a swipe may dismiss the drawer. */
	readonly dismissible: boolean;
	readonly shouldCloseOnEscape: boolean;
	readonly shouldCloseOnInteractOutside: boolean;
	/** Reference to the trigger element. */
	readonly triggerRef: HTMLElement | null;
	/** Index among the open modal layers, for z-index math. */
	readonly stackLevel: number;
	/**
	 * Index among the open DRAWERS, in open order — `0` is the one at the back.
	 * Published by `Drawer.Content`; `Drawer.Overlay` uses it to stay out of the way
	 * of the backdrop already on screen.
	 */
	readonly stackIndex: number;
	setStackIndex: (index: number) => void;

	/** ids of the `Drawer.Title` parts, for `aria-labelledby`. */
	readonly labelledBy: string | undefined;
	/** ids of the `Drawer.Description` parts, for `aria-describedby`. */
	readonly describedBy: string | undefined;
	/** Registers a label id; the returned function unregisters it. */
	registerLabel: (id: string) => () => void;
	/** Registers a description id; the returned function unregisters it. */
	registerDescription: (id: string) => () => void;

	/** Resting positions the panel may settle on, if any. */
	readonly snapPoints: readonly DrawerSnapPoint[] | undefined;
	/** The active snap point, or `null` when the drawer is fully open. */
	readonly snapPoint: DrawerSnapPoint | null;
	/** Whether a flick may skip past the neighbouring snap point. */
	readonly snapToSequentialPoints: boolean;
	/** Moves to a snap point. Called by `Drawer.Content` when a drag settles. */
	setSnapPoint: (point: DrawerSnapPoint | null, event?: Event) => void;

	/** How far the panel has been dragged toward dismissal, 0–1. */
	readonly swipeProgress: number;
	/** Whether a drag is currently in flight. */
	readonly isSwiping: boolean;
	/** Published by `Drawer.Content`, which owns the gesture. */
	setSwipeState: (progress: number, isSwiping: boolean) => void;

	/**
	 * Distance, in px, that an opening drag from `Drawer.SwipeArea` has travelled, or
	 * `null` when no such drag is in flight. The panel follows it instead of playing
	 * its enter animation, so the drawer arrives with the finger.
	 */
	readonly swipeOpenDistance: number | null;
	setSwipeOpenDistance: (distance: number | null) => void;
	/** Panel extent along its axis, published by `Drawer.Content`. */
	readonly panelExtent: number;
	setPanelExtent: (extent: number) => void;

	setTriggerRef: (el: HTMLElement | null) => void;
	setStackLevel: (level: number) => void;
	/** Open the drawer. */
	open: () => void;
	/** Close the drawer and return focus to the trigger. */
	close: (reason?: DrawerCloseReason, event?: Event) => void;
	/** Toggle the open state. */
	toggle: () => void;
	/** Called when the open state changes. */
	onOpenChange: (open: boolean) => void;
};

const DRAWER_CONTEXT_KEY = Symbol('drawer');

export function setDrawerContext(ctx: DrawerContext) {
	setContext(DRAWER_CONTEXT_KEY, ctx);
}

export function getDrawerContext(): DrawerContext | undefined {
	return getContext<DrawerContext>(DRAWER_CONTEXT_KEY);
}

/**
 * Reads the context or throws with the offending part's name. Every part needs
 * the context to function, so a missing provider is a developer error worth
 * failing loudly on rather than rendering something subtly broken.
 */
export function requireDrawerContext(part: string): DrawerContext {
	const ctx = getDrawerContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Drawer.Root`);
	}
	return ctx;
}
