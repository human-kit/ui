<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	import { browser } from '../internal/environment';

	type PortalProps = {
		/** Target element or selector to render into. Defaults to document.body */
		target?: string | HTMLElement;
		/** Content to render in the portal */
		children?: Snippet;
	};

	let { target = 'body', children }: PortalProps = $props();

	let wrapper: HTMLDivElement | undefined = $state();

	// Resolve and (re-)portal reactively so changing `target` after mount moves
	// the content to the new container. `appendChild` moves the node, so no
	// explicit detach is needed between targets.
	$effect(() => {
		if (!browser || !wrapper) return;

		const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
		if (!targetEl) {
			// Keep the content where it currently lives (initial inline position
			// or the previous target) and report the unresolved target.
			console.error(`Portal: target "${target}" not found`);
			return;
		}

		targetEl.appendChild(wrapper);
	});

	onDestroy(() => {
		// Wrapper will be automatically removed when component is destroyed
		// because Svelte still controls it
		if (wrapper && wrapper.parentNode) {
			wrapper.parentNode.removeChild(wrapper);
		}
	});
</script>

<div bind:this={wrapper} style="display: contents;">
	{#if children}
		{@render children()}
	{/if}
</div>
