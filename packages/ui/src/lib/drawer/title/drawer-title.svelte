<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { requireDrawerContext } from '../root/context';

	/**
	 * Drawer.Title — the panel's accessible name.
	 *
	 * Registers its id with the root, which hands it to `Drawer.Content` as
	 * `aria-labelledby`. Writing a bare heading instead leaves the drawer unnamed:
	 * a `role="dialog"` takes its name from `aria-labelledby`/`aria-label`, never
	 * from the text inside it.
	 */
	type DrawerTitleProps = {
		/** The drawer's name. */
		children?: Snippet;
		/** CSS class for the heading. */
		class?: string;
		/** Overrides the generated id. */
		id?: string;
	} & Omit<HTMLAttributes<HTMLHeadingElement>, 'class' | 'children' | 'id'>;

	let { children, class: className = '', id: idProp, ...restProps }: DrawerTitleProps = $props();

	const ctx = requireDrawerContext('Drawer.Title');
	const generatedId = $props.id();
	const id = $derived(idProp ?? generatedId);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => ctx.registerLabel(id));
</script>

<h2 {id} class={className} data-drawer-title {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</h2>
