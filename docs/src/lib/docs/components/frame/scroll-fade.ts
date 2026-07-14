import type { Action } from 'svelte/action';

/**
 * Drives the `.scroll-fade` mask (see theme.css): sets `--fade-top` /
 * `--fade-bottom` to 1 whenever there is scrollable content past that edge, 0
 * otherwise, so the fade only shows on the side you can still scroll toward.
 *
 * Pair with `class="scroll-fade"` on the same scrolling element. Recomputes on
 * scroll, on element resize, and when descendants change (e.g. a nav group
 * collapses/expands, which changes the scrollable height without a scroll
 * event). A 1px epsilon absorbs sub-pixel rounding at the extremes.
 */
export const scrollFade: Action = (node) => {
	const update = () => {
		const { scrollTop, scrollHeight, clientHeight } = node;
		const max = scrollHeight - clientHeight;
		node.style.setProperty('--fade-top', scrollTop > 1 ? '1' : '0');
		node.style.setProperty('--fade-bottom', scrollTop < max - 1 ? '1' : '0');
	};

	update();
	node.addEventListener('scroll', update, { passive: true });

	const resizeObserver = new ResizeObserver(update);
	resizeObserver.observe(node);

	// Catch content-height changes that fire no scroll event — collapsible nav
	// groups toggling `hidden`/height, async content, etc.
	const mutationObserver = new MutationObserver(update);
	mutationObserver.observe(node, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['hidden', 'style', 'data-open']
	});

	return {
		destroy() {
			node.removeEventListener('scroll', update);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		}
	};
};
