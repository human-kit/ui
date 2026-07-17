/**
 * Wraps every fenced code block in a positioned host so a copy button can be
 * hung in its corner:
 *
 *   <div class="code-block"><pre class="shiki">…</pre></div>
 *
 * Why a `raw` node and not an element: @human-kit/markdown highlights at the
 * MDAST stage (remarkHighlight), replacing each `code` node with shiki's HTML as
 * a STRING. By the time rehype runs, that block is a single `raw` node — there is
 * no `<pre>` element in the tree to wrap, so the wrapper is spliced onto the
 * string instead. The value arrives as:
 *
 *   <!-- svelte-ignore a11y_no_noninteractive_tabindex -->\n<pre class="shiki">…
 *
 * and the wrapper goes OUTSIDE that comment, which must stay glued to the <pre>
 * it silences (shiki gives the <pre> a tabindex).
 *
 * Doing this at build time — rather than wrapping on the client — matters twice
 * over:
 *
 *  1. Reparenting a `<pre>` that Svelte rendered breaks on navigation: Svelte
 *     removes the nodes it owns and the hand-made wrapper is left behind holding
 *     a stale block from the previous page.
 *  2. The button must sit OUTSIDE the `<pre>`, which is the horizontal scroll
 *     container: an absolutely positioned child of a scroller scrolls away with
 *     the content instead of staying pinned to the corner.
 *
 * The button is mounted into the wrapper on the client (components/code-copy);
 * `.code-block` gets `position: relative` from theme.css.
 *
 * @returns {(tree: any) => void} a rehype transformer
 */
export function rehypeCodeCopy() {
	/** @param {any} node */
	const isHighlightedBlock = (node) =>
		node?.type === 'raw' && typeof node.value === 'string' && /<pre[^>]*\bshiki\b/.test(node.value);

	return (/** @type {any} */ tree) => {
		/** @param {any} node */
		const walk = (node) => {
			if (!Array.isArray(node.children)) return;
			for (const child of node.children) {
				walk(child);
				if (isHighlightedBlock(child)) {
					child.value = `<div class="code-block">${child.value}</div>`;
				}
			}
		};
		walk(tree);
	};
}
