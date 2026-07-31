/** Edge the drawer is anchored to. Also sets the axis it travels along. */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * How much of the page the drawer takes over.
 *
 * - `true` — focus is trapped, the background is hidden from assistive tech, and
 *   page scrolling is locked.
 * - `'trap-focus'` — focus is trapped, but the page keeps scrolling and stays
 *   readable. For a persistent panel that still owns the keyboard.
 * - `false` — none of the above; the drawer is a floating panel the rest of the
 *   page keeps working around it.
 */
export type DrawerModal = boolean | 'trap-focus';

export type DrawerCloseReason =
	'escape-key' | 'outside-press' | 'swipe' | 'imperative-action' | 'none';

/**
 * A resting position for the panel.
 *
 * - `0` to `1` — a fraction of the viewport along the drawer's axis.
 * - a number above `1` — pixels.
 * - a string — any CSS length or percentage (`'148px'`, `'30rem'`, `'50%'`),
 *   resolved against the viewport.
 */
export type DrawerSnapPoint = number | string;

/** Helper object passed to the `children` snippet of `Drawer.Root`. */
export type DrawerStateHelpers<Payload = unknown> = {
	/** Close the drawer. */
	close: () => void;
	/** Open the drawer. */
	open: () => void;
	/** Toggle the open state. */
	toggle: () => void;
	/** Whether the drawer is currently open. */
	isOpen: boolean;
	/** Value carried by the trigger that opened it, when using a detached handle. */
	payload: Payload | undefined;
};
