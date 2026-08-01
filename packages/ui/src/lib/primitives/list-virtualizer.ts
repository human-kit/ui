/**
 * Window maths for a vertically virtualized list of uniform-height rows.
 *
 * Pure and framework-free so the arithmetic can be tested on its own: everything about
 * *when* to recompute (scroll, resize, measurement) belongs to the component that calls it.
 *
 * Rows are assumed to be the same height. That is the trade this makes to stay cheap —
 * knowing the height of every row up front is what lets the list place a scrollbar of the
 * right size without measuring a thousand elements. A list of mixed-height rows must not be
 * virtualized with this.
 */

export type ListWindowOptions = {
	/** How many rows the list holds in total, not how many are rendered. */
	count: number;
	/** Height of one row, in pixels. */
	itemHeight: number;
	/** Vertical space between rows (a flex/grid `gap`), in pixels. */
	gap?: number;
	/** Height of the scrolling viewport, in pixels. */
	viewportHeight: number;
	/** Current scroll offset of that viewport, in pixels. */
	scrollTop: number;
	/**
	 * Rows rendered beyond each edge of the viewport, as a buffer against how long a row
	 * takes to render: while the main thread builds rows the compositor keeps scrolling, and
	 * anything past the last rendered row shows as blank.
	 */
	overscan?: number;
	/**
	 * The scroller's top padding, in pixels.
	 *
	 * `scrollTop` is measured from the top of the padding box but the rows start after it, so
	 * ignoring it offsets every row by that much — a few pixels, which is exactly enough to
	 * leave a row clipped by the edge it was just scrolled to.
	 */
	padding?: number;
};

export type ListWindow = {
	/** First rendered index (inclusive). */
	from: number;
	/** Last rendered index (inclusive). `from - 1` when there is nothing to render. */
	to: number;
	/** Distance from the top of the content to the first rendered row, in pixels. */
	offset: number;
	/** Height the full list would occupy, so the scrollbar matches the real count. */
	contentHeight: number;
};

/** Distance from one row's top edge to the next one's. */
function pitchOf(itemHeight: number, gap: number): number {
	return Math.max(1, itemHeight + gap);
}

export function computeListWindow({
	count,
	itemHeight,
	gap = 0,
	viewportHeight,
	scrollTop,
	overscan = 0,
	padding = 0
}: ListWindowOptions): ListWindow {
	if (count <= 0 || itemHeight <= 0) {
		return { from: 0, to: -1, offset: 0, contentHeight: 0 };
	}

	const pitch = pitchOf(itemHeight, gap);
	// No trailing gap: the last row ends the content.
	const contentHeight = count * pitch - gap;

	// One extra row: a viewport that isn't a whole multiple of the pitch shows part of one
	// more, and that partial row still has to exist.
	const visibleCount = Math.max(1, Math.ceil(Math.max(0, viewportHeight) / pitch) + 1);
	const startIndex = Math.min(
		count - 1,
		Math.max(0, Math.floor(Math.max(0, scrollTop - padding) / pitch))
	);

	const from = Math.max(0, startIndex - overscan);
	const to = Math.min(count - 1, startIndex + visibleCount - 1 + overscan);

	return { from, to, offset: from * pitch, contentHeight };
}

export type ScrollIntoViewOptions = {
	index: number;
	count: number;
	itemHeight: number;
	gap?: number;
	viewportHeight: number;
	scrollTop: number;
	/** The scroller's top padding — see {@link ListWindowOptions.padding}. */
	padding?: number;
	/**
	 * How to place the row.
	 *
	 * `nearest` moves as little as possible, which is what stepping through a list with the
	 * arrows wants. `center` puts the row in the middle of the viewport, for when the list
	 * opens on a selection the user has to *find*: flush against an edge reads as "the list
	 * happens to end here" and, one pixel off, as a row cut in half.
	 */
	align?: 'nearest' | 'center';
};

/**
 * The scroll offset that brings a row fully into view, or `null` when it already is.
 *
 * Returning `null` for the no-op case matters: assigning `scrollTop` unconditionally on
 * every focus change fights the user's own scrolling and makes the list jitter while the
 * pointer moves over it.
 */
export function scrollTopForIndex({
	index,
	count,
	itemHeight,
	gap = 0,
	viewportHeight,
	scrollTop,
	padding = 0,
	align = 'nearest'
}: ScrollIntoViewOptions): number | null {
	if (index < 0 || index >= count || itemHeight <= 0) {
		return null;
	}

	const pitch = pitchOf(itemHeight, gap);
	const contentHeight = count * pitch - gap;
	const maxScrollTop = Math.max(0, padding * 2 + contentHeight - viewportHeight);
	const clamp = (value: number) => Math.min(Math.max(0, value), maxScrollTop);

	const top = padding + index * pitch;
	const bottom = top + itemHeight;

	if (align === 'center') {
		const centered = clamp(top - (viewportHeight - itemHeight) / 2);

		return centered === scrollTop ? null : centered;
	}

	if (top < scrollTop) {
		return clamp(top);
	}

	if (bottom > scrollTop + viewportHeight) {
		return clamp(bottom - viewportHeight);
	}

	return null;
}
