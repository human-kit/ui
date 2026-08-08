/** Which of the two lists something refers to. */
export type TransferListSide = 'source' | 'target';

/** Identity of an item, as returned by the Root's `getKey`. */
export type TransferListKey = string | number;

/** What a completed change reports to `onChange` and to the live region. */
export type TransferListMoveDetails = {
	/**
	 * Whether items crossed to the other list, or were reordered within the right-hand one.
	 * A reorder has `from` and `to` both `'target'`.
	 */
	type: 'move' | 'reorder';
	/** The keys that actually moved — disabled items are never among them. */
	keys: TransferListKey[];
	/** The list they came from. */
	from: TransferListSide;
	/** The list they landed in. */
	to: TransferListSide;
	/** Which way a reorder went. Absent for a move. */
	direction?: 'up' | 'down';
};

/** The list opposite `side`. */
export function oppositeSide(side: TransferListSide): TransferListSide {
	return side === 'source' ? 'target' : 'source';
}
