<script lang="ts">
	import { readable } from 'svelte/store';
	import { ButtonRoot } from '../../button/index.js';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import type { BreadcrumbsEllipsisProps } from '../types.js';
	import { useBreadcrumbsContext } from '../root/context';

	/**
	 * Breadcrumbs.Ellipsis — the button that stands for the folded middle of a long trail.
	 *
	 * Put it in the list after the first item. It renders only while the trail is folded, as an
	 * `<li>` with a button named "Show N more pages", in the locale of `LocaleProvider`. A press
	 * unfolds the trail, and the focus moves to the first page that comes into view: the button
	 * is gone, and a focus left on nothing is a focus lost.
	 */
	let {
		children,
		class: className = '',
		itemClass = '',
		separator,
		'aria-label': ariaLabelProp,
		element = $bindable<HTMLButtonElement | null>(null),
		onclick,
		...restProps
	}: BreadcrumbsEllipsisProps = $props();

	const breadcrumbs = useBreadcrumbsContext('Breadcrumbs.Ellipsis');

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;
	const ariaLabel = $derived(
		ariaLabelProp ??
			resolveLocalizedString($localeStore, 'breadcrumbs.showMore', {
				count: breadcrumbs.hiddenCount
			})
	);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		breadcrumbs.expand();
	}
</script>

{#if breadcrumbs.collapsed}
	<li class={itemClass} data-breadcrumbs-ellipsis="true">
		<ButtonRoot
			{...restProps}
			bind:element
			class={className}
			type="button"
			aria-label={ariaLabel}
			data-breadcrumbs-ellipsis-button="true"
			onclick={handleClick}
		>
			{#if children}{@render children()}{:else}…{/if}
		</ButtonRoot>
		{@render separator?.()}
	</li>
{/if}
