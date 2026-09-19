<script lang="ts">
	import type { BreadcrumbsItemProps } from '../types.js';

	/**
	 * Breadcrumbs.Item — one page of the trail.
	 *
	 * It is an `<li>` with a `Breadcrumbs.Link` in it, and a `Breadcrumbs.Separator` after the
	 * link on every item but the last. The separator is in the item, not between two items,
	 * thus the list holds items only and its count is the count of pages.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLLIElement | null>(null),
		...restProps
	}: BreadcrumbsItemProps = $props();

	let itemRef: HTMLLIElement | null = $state(null);

	$effect(() => {
		element = itemRef;
		return () => {
			element = null;
		};
	});
</script>

<li {...restProps} bind:this={itemRef} class={className} data-breadcrumbs-item="true">
	{@render children?.()}
</li>
