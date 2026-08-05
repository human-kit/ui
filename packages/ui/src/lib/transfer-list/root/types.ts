/** Which of the two lists something refers to. */
export type TransferListSide = 'source' | 'target';

/** Identity of an item, as returned by the Root's `getKey`. */
export type TransferListKey = string | number;

/** What a completed move reports to `onChange` and to the live region. */
export type TransferListMoveDetails = {
	/** The keys that actually moved — disabled items are never among them. */
	keys: TransferListKey[];
	/** The list they came from. */
	from: TransferListSide;
	/** The list they landed in. */
	to: TransferListSide;
};

/** The list opposite `side`. */
export function oppositeSide(side: TransferListSide): TransferListSide {
	return side === 'source' ? 'target' : 'source';
}
