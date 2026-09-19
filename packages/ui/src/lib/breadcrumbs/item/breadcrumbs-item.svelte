<script lang="ts">
	import type { BreadcrumbsItemProps } from '../types.js';
	import { useBreadcrumbsContext } from '../root/context';

	/**
	 * Breadcrumbs.Item — one page of the trail.
	 *
	 * It is an `<li>` with a `Breadcrumbs.Link` in it, and a `Breadcrumbs.Separator` after the
	 * link on every item but the last. The separator is in the item, not between two items,
	 * thus the list holds items only and its count is the count of pages. In a folded trail, an
	 * item of the middle renders nothing until the trail unfolds.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLLIElement | null>(null),
		...restProps
	}: BreadcrumbsItemProps = $props();

	const breadcrumbs = useBreadcrumbsContext('Breadcrumbs.Item');
	// Registered at creation, not in an effect: the place in the trail must be known before the
	// first render, or a folded item would paint once and go.
	const id = $props.id();
	const unregister = breadcrumbs.register(id);
	$effect(() => unregister);
	const hidden = $derived(breadcrumbs.isHidden(id));

	let itemRef: HTMLLIElement | null = $state(null);

	$effect(() => {
		element = itemRef;
		return () => {
			element = null;
		};
	});
</script>

{#if !hidden}
	<li {...restProps} bind:this={itemRef} class={className} data-breadcrumbs-item="true">
		{@render children?.()}
	</li>
{/if}
