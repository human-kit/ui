<script lang="ts">
	import type { BreadcrumbsSeparatorProps } from '../types.js';

	/**
	 * Breadcrumbs.Separator — the sign between two pages of the trail.
	 *
	 * It is hidden from the screen reader: the list already separates the items, and a slash
	 * read aloud between each two is noise. Put it in the item, after the link.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLSpanElement | null>(null),
		...restProps
	}: BreadcrumbsSeparatorProps = $props();

	let separatorRef: HTMLSpanElement | null = $state(null);

	$effect(() => {
		element = separatorRef;
		return () => {
			element = null;
		};
	});
</script>

<span
	{...restProps}
	bind:this={separatorRef}
	aria-hidden="true"
	class={className}
	data-breadcrumbs-separator="true"
>
	{#if children}{@render children()}{:else}/{/if}
</span>
