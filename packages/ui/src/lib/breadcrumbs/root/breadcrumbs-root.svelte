<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import type { BreadcrumbsRootProps } from '../types.js';

	/**
	 * Breadcrumbs.Root — the trail of pages above the one the user is on.
	 *
	 * It is a `<nav>` landmark named "Breadcrumb", in the locale of `LocaleProvider`: a screen
	 * reader user finds it in the list of landmarks, apart from the main navigation. Put a
	 * `Breadcrumbs.List` in it.
	 */
	let {
		children,
		class: className = '',
		'aria-label': ariaLabelProp,
		element = $bindable<HTMLElement | null>(null),
		...restProps
	}: BreadcrumbsRootProps = $props();

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;
	const ariaLabel = $derived(
		ariaLabelProp ?? resolveLocalizedString($localeStore, 'breadcrumbs.label')
	);

	let navRef: HTMLElement | null = $state(null);

	$effect(() => {
		element = navRef;
		return () => {
			element = null;
		};
	});
</script>

<nav
	{...restProps}
	bind:this={navRef}
	aria-label={ariaLabel}
	class={className}
	data-breadcrumbs-root="true"
>
	{@render children?.()}
</nav>
