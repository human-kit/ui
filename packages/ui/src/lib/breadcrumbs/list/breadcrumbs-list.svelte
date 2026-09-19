<script lang="ts">
	import type { BreadcrumbsListProps } from '../types.js';

	/**
	 * Breadcrumbs.List — the ordered list of the trail.
	 *
	 * It is an `<ol>`: the order of the items is the order of the pages, from the root of the
	 * site to the page the user is on, and a screen reader says how many there are. The role is
	 * on it in writing: some browsers drop the list from the accessibility tree when its
	 * `list-style` is `none`, which every trail sets.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLOListElement | null>(null),
		...restProps
	}: BreadcrumbsListProps = $props();

	let listRef: HTMLOListElement | null = $state(null);

	$effect(() => {
		element = listRef;
		return () => {
			element = null;
		};
	});
</script>

<ol {...restProps} bind:this={listRef} role="list" class={className} data-breadcrumbs-list="true">
	{@render children?.()}
</ol>
