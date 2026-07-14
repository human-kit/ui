<script lang="ts">
	import { Menu } from '@human-kit/svelte-components';
	import type { ComponentProps, Snippet } from 'svelte';

	type Props = Omit<ComponentProps<typeof Menu.Root>, 'children'> & {
		children?: Snippet;
	};

	let { children, open = $bindable(), ...rootProps }: Props = $props();
</script>

<Menu.Root bind:open {...rootProps}>
	{#if children}
		{@render children()}
	{/if}
</Menu.Root>
