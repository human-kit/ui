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
		/** The text that a screen reader announces after the title. */
		children?: Snippet;
		/** The CSS class names of the paragraph. */
		class?: string;
		/** Replaces the id that the component makes. */
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
