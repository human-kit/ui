<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { requireDrawerContext } from '../root/context';

	/**
	 * Drawer.Description — supporting text announced after the title.
	 *
	 * Registers its id with the root, which hands it to `Drawer.Content` as
	 * `aria-describedby`, so a screen reader reads it when the drawer opens rather
	 * than only when the user happens to arrow onto it.
	 */
	type DrawerDescriptionProps = {
		/** Supporting text announced after the title. */
		children?: Snippet;
		/** CSS class for the paragraph. */
		class?: string;
		/** Overrides the generated id. */
		id?: string;
	} & Omit<HTMLAttributes<HTMLParagraphElement>, 'class' | 'children' | 'id'>;

	let {
		children,
		class: className = '',
		id: idProp,
		...restProps
	}: DrawerDescriptionProps = $props();

	const ctx = requireDrawerContext('Drawer.Description');
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	$effect(() => ctx.registerDescription(id));
</script>

<p {id} class={className} data-drawer-description {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</p>
