import { getContext, setContext } from 'svelte';
import type { ListBoxContext } from '../../listbox/root/context';
import type { TransferListKey, TransferListMoveDetails, TransferListSide } from './types';

/**
 * Shared state for the two lists and the move buttons.
 *
 * The Root owns the single source of truth — which side each item is on — and every
 * part reads its slice of it from here. Nothing else writes: a move goes through
 * `move()` so the selection reset, the focus hand-off and the announcement all
 * happen in one place.
 */
export type TransferListContext<T = unknown> = {
	/** Identity of an item. */
	getKey: (item: T) => TransferListKey;
	/** Items currently on the left, in the order they were given to the Root. */
	sourceItems: T[];
	/** Items currently on the right, in the order they were moved there. */
	targetItems: T[];
	/** Whether an item is pinned to its side. */
	isDisabled: (key: TransferListKey) => boolean;

	/** Items of one side. */
	getItems: (side: TransferListSide) => T[];
	/** Keys of one side that are allowed to move. */
	getMovableKeys: (side: TransferListSide) => TransferListKey[];
	/** Selected keys of one side that are allowed to move. */
	getMovableSelection: (side: TransferListSide) => TransferListKey[];

	/** Current selection of one side. */
	getSelection: (side: TransferListSide) => TransferListKey[];
	/** Replaces the selection of one side (called by that side's ListBox). */
	setSelection: (side: TransferListSide, keys: TransferListKey[]) => void;

	/** Accessible name of one side, used by the buttons and the live region too. */
	getLabel: (side: TransferListSide) => string;
	/** Registered by each list from its `label` prop. */
	setLabel: (side: TransferListSide, label: string) => void;

	/**
	 * The inner ListBox's context, kept so a move can put keyboard focus on a specific
	 * row of the destination — the same handle `ComboBox` takes to drive its list.
	 */
	getListContext: (side: TransferListSide) => ListBoxContext | null;
	setListContext: (side: TransferListSide, ctx: ListBoxContext | null) => void;
	/** The list's own element, for when focus has to land on the list rather than a row. */
	getListElement: (side: TransferListSide) => HTMLElement | null;
	setListElement: (side: TransferListSide, element: HTMLElement | null) => void;

	/**
	 * Moves items to `to`. Keys that are disabled, or that are not on the originating
	 * side, are dropped rather than moved.
	 */
	move: (keys: Iterable<TransferListKey>, to: TransferListSide) => void;
	/** Registers the keys a list is showing once its `filter` has run. */
	setVisibleKeys: (side: TransferListSide, keys: TransferListKey[] | null) => void;
	/** Shifts the right-hand selection one position within `value`. */
	reorder: (direction: 'up' | 'down') => void;
	/** Whether a reorder in that direction would change anything. */
	canReorder: (direction: 'up' | 'down') => boolean;
	/** Whether Ctrl/Cmd+Enter inside a list sends its selection to the other one. */
	moveShortcut: boolean;
	/** The last completed move, or `null` before the first one. Drives the live region. */
	lastMove: TransferListMoveDetails | null;

	/**
	 * Focuses the row at `index` on `side`, clamped to the last one. Returns `false` when
	 * that side has no rows left, which is the caller's cue to send focus somewhere else
	 * rather than leave it on the `<body>`.
	 */
	focusItemAt: (side: TransferListSide, index: number) => boolean;
	/** Focuses the list itself. */
	focusList: (side: TransferListSide) => void;
};

/** Which list a part belongs to. Set by each list, read by the items inside it. */
const SIDE_KEY = Symbol('transfer-list-side');

export function setTransferListSide(side: TransferListSide) {
	setContext(SIDE_KEY, side);
}

export function useTransferListSide(part: string): TransferListSide {
	const side = getContext<TransferListSide | undefined>(SIDE_KEY);
	if (!side) {
		throw new Error(`${part} must be used inside a TransferList.Source or TransferList.Target`);
	}
	return side;
}

const KEY = Symbol('transfer-list');

export function setTransferListContext<T>(ctx: TransferListContext<T>) {
	setContext(KEY, ctx);
}

export function useTransferListContext<T = unknown>(part: string): TransferListContext<T> {
	const ctx = getContext<TransferListContext<T>>(KEY);
	if (!ctx) {
		throw new Error(`${part} must be used inside a TransferList.Root`);
	}
	return ctx;
}
