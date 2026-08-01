<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '../../internal/environment';
	import { setDrawerKeyboardContext } from '../root/keyboard-context';

	/**
	 * Drawer.VirtualKeyboardProvider — keeps a drawer's fields above the software
	 * keyboard.
	 *
	 * Wrap it around `Drawer.Root` (it renders no element of its own). While the
	 * keyboard is up, `Drawer.Content` exposes `--drawer-keyboard-inset` — the height
	 * the keyboard covers — so a footer can be lifted clear of it:
	 *
	 * ```css
	 * .Footer { padding-bottom: var(--drawer-keyboard-inset, 0px); }
	 * ```
	 *
	 * The variable is only set while the keyboard is actually up, which is what makes
	 * the `0px` fallback the right default rather than a guess.
	 *
	 * On a phone the keyboard shrinks the VISUAL viewport without touching the layout
	 * viewport, so nothing in CSS notices it — `100vh` still spans the full screen and
	 * a bottom sheet ends up underneath the keys. `window.visualViewport` is the only
	 * thing that reports the difference. Where it is missing (older browsers, and
	 * every desktop where this does not apply anyway) the provider is inert.
	 */
	type DrawerVirtualKeyboardProviderProps = {
		/** The subtree the keyboard inset is published to. */
		children?: Snippet;
	};

	let { children }: DrawerVirtualKeyboardProviderProps = $props();

	let inset = $state(0);

	setDrawerKeyboardContext({
		get inset() {
			return inset;
		}
	});

	$effect(() => {
		if (!browser) return;
		const viewport = window.visualViewport;
		if (!viewport) return;

		function measure() {
			if (!viewport) return;
			const layoutHeight = document.documentElement.clientHeight;
			// `offsetTop` matters when the user has pinch-zoomed and panned: the visual
			// viewport is then both shorter AND offset, and ignoring it reports an inset
			// that is off by the pan distance.
			const covered = layoutHeight - (viewport.height + viewport.offsetTop);
			// Sub-pixel noise is constant on HiDPI screens; anything under a few pixels
			// is not a keyboard.
			inset = covered > 4 ? covered : 0;
		}

		measure();
		viewport.addEventListener('resize', measure);
		viewport.addEventListener('scroll', measure);

		return () => {
			viewport.removeEventListener('resize', measure);
			viewport.removeEventListener('scroll', measure);
		};
	});

	// Bring the focused field back into view once the keyboard has settled. The
	// browser does this for the document scroller on its own, but not for a field
	// inside a fixed-position panel.
	$effect(() => {
		if (!browser || inset <= 0) return;

		const frame = requestAnimationFrame(() => {
			const active = document.activeElement;
			if (!(active instanceof HTMLElement)) return;
			if (!active.closest('[data-drawer-content]')) return;
			active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		});

		return () => cancelAnimationFrame(frame);
	});
</script>

{#if children}
	{@render children()}
{/if}
