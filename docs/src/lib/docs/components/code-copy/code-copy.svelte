<script lang="ts">
	import { mount, unmount } from 'svelte';
	import { page } from '$app/state';
	import CopyButton from '../copy-button/copy-button.svelte';

	// Hangs a copy button in the corner of every fenced code block on the page.
	// Renders nothing itself: the blocks come from the markdown pipeline, which
	// wraps each one in `.code-block` (see markdown/rehype-code-copy.js), and this
	// mounts a <CopyButton> into each wrapper. Mounting into a wrapper that is
	// ALREADY in the markup is what keeps this safe — no Svelte-owned node is ever
	// moved, so swapping the page can't leave a stale block behind.
	//
	// The demo cards are untouched: their source blocks come from a different
	// pipeline (the demoHighlight vite plugin), get no wrapper, and already carry
	// a copy button in their toolbar.
	interface Props {
		/** Wrappers to enhance. */
		selector?: string;
	}

	let { selector = '.code-block' }: Props = $props();

	$effect(() => {
		// Re-run whenever the route changes (after the new page's blocks render).
		void page.url.pathname;

		const mounted = document.querySelectorAll<HTMLElement>(selector);
		const instances = [...mounted].flatMap((block) => {
			const pre = block.querySelector('pre');
			if (!pre) return [];
			// Read the code BEFORE the button joins the wrapper, so no button text
			// can end up in the clipboard.
			const text = pre.textContent ?? '';
			return mount(CopyButton, {
				target: block,
				props: {
					text,
					label: 'Copy code',
					class: 'absolute top-1.5 right-1.5'
				}
			});
		});

		return () => instances.forEach((instance) => unmount(instance));
	});
</script>
