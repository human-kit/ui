<script lang="ts">
	import { Collapsible } from '@human-kit/ui';
	import type { ComponentProps, Snippet } from 'svelte';

	// Pass-through: the docs collapsibles style their own root (a nav group, a demo
	// card, a table row), so there's no shared root chrome to bake in here.
	type Props = Omit<ComponentProps<typeof Collapsible.Root>, 'children'> & {
		children?: Snippet;
	};

	let { children, open = $bindable(), ...rootProps }: Props = $props();
</script>

<Collapsible.Root bind:open {...rootProps}>
	{#if children}
		{@render children()}
	{/if}
</Collapsible.Root>
