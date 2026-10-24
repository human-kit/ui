/**
 * Inline style for content that only assistive technology reads, such as a live region.
 * Inline, because the library is headless and must not depend on an `sr-only` class.
 *
 * `position: fixed`, not `absolute`: an absolutely positioned element inside a scroll container
 * that is not itself positioned is laid out against an ancestor outside the scroller. While the
 * container scrolls, Chrome then promotes the content around it (a sticky header, say) to its own
 * compositing layer to keep the element in place, and that layer drops subpixel anti-aliasing
 * from its text. A fixed element is laid out against the viewport and never escapes a scroller.
 *
 * Native form controls that stand in for a custom one (a hidden `<input>` or `<select>`) keep
 * their own absolute style: the browser anchors its validation bubble to them, so they have to
 * stay where the visible control is.
 */
export const visuallyHiddenStyle =
	'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
