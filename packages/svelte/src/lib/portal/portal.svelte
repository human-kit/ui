<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';

	type PortalProps = {
		/** Target element or selector to render into. Defaults to document.body */
		target?: string;
		/** Content to render in the portal */
		children?: Snippet;
	};

	let { target = 'body', children }: PortalProps = $props();

	let wrapper: HTMLDivElement | undefined = $state();

	onMount(async () => {
		if (!browser || !wrapper) return;

		await tick();
		const wrapperNode = wrapper;
		if (!wrapperNode) return;

		const targetEl = document.querySelector(target);
		if (!targetEl) {
			console.error(`Portal: target "${target}" not found`);
			return;
		}

		targetEl.appendChild(wrapperNode);
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
