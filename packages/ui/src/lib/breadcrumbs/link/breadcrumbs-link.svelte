<script lang="ts">
	import type { BreadcrumbsLinkProps } from '../types.js';

	/**
	 * Breadcrumbs.Link — the page, as a link.
	 *
	 * It is an `<a>` with an `href`, and a `<span>` without one. `current` marks the page the
	 * user is on with `aria-current="page"`. `disabled` takes the `href` away: a link with no
	 * address is out of the tab order on its own, with no `tabindex` to manage.
	 */
	let {
		children,
		class: className = '',
		href,
		current = false,
		disabled = false,
		element = $bindable<HTMLAnchorElement | HTMLSpanElement | null>(null),
		...restProps
	}: BreadcrumbsLinkProps = $props();

	let linkRef: HTMLAnchorElement | HTMLSpanElement | null = $state(null);
	const isLink = $derived(Boolean(href) && !disabled);

	$effect(() => {
		element = linkRef;
		return () => {
			element = null;
		};
	});
</script>

<!-- Without an address, the text is not a link: a span says so, where an anchor with no href
     still reads as a link to some screen readers. -->
<svelte:element
	this={isLink ? 'a' : 'span'}
	{...restProps}
	bind:this={linkRef}
	href={isLink ? href : undefined}
	aria-current={current ? 'page' : undefined}
	aria-disabled={disabled ? 'true' : undefined}
	class={className}
	data-breadcrumbs-link="true"
	data-current={current || undefined}
	data-disabled={disabled || undefined}
>
	{@render children?.()}
</svelte:element>
