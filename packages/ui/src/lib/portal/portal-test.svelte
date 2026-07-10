<script lang="ts">
	import { untrack } from 'svelte';
	import Portal from './portal.svelte';

	type Props = {
		/** Initial target passed to the Portal (selector). Defaults to the body. */
		initialTarget?: string;
		showPortal?: boolean;
	};

	let { initialTarget, showPortal = true }: Props = $props();

	let elementTarget = $state<HTMLElement>();
	let target = $state<string | HTMLElement | undefined>(untrack(() => initialTarget));
</script>

<!-- Everything lives inside this container so moving content to document.body
     (the default target) is observable in tests. -->
<div data-testid="harness-root">
	<div data-testid="target-a" id="portal-target-a"></div>
	<div data-testid="target-b" id="portal-target-b"></div>
	<div data-testid="element-target" bind:this={elementTarget}></div>

	<button type="button" data-testid="to-a" onclick={() => (target = '#portal-target-a')}>
		to selector a
	</button>
	<button type="button" data-testid="to-b" onclick={() => (target = '#portal-target-b')}>
		to selector b
	</button>
	<button type="button" data-testid="to-element" onclick={() => (target = elementTarget)}>
		to element
	</button>
	<button type="button" data-testid="to-missing" onclick={() => (target = '#does-not-exist')}>
		to missing
	</button>

	{#if showPortal}
		{#if target !== undefined}
			<Portal {target}>
				<span data-testid="portal-content">portal content</span>
			</Portal>
		{:else}
			<Portal>
				<span data-testid="portal-content">portal content</span>
			</Portal>
		{/if}
	{/if}
</div>
