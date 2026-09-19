<script lang="ts">
	import { tick } from 'svelte';
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import type { BreadcrumbsRootProps } from '../types.js';
	import { setBreadcrumbsContext, type BreadcrumbsContext } from './context';

	/**
	 * Breadcrumbs.Root — the trail of pages above the one the user is on.
	 *
	 * It is a `<nav>` landmark named "Breadcrumb", in the locale of `LocaleProvider`: a screen
	 * reader user finds it in the list of landmarks, apart from the main navigation. Put a
	 * `Breadcrumbs.List` in it.
	 *
	 * `maxItems` folds the middle of a long trail: the first item and the last `maxItems - 1`
	 * stay in view, and a `Breadcrumbs.Ellipsis` in the list stands for the rest until a press
	 * unfolds them.
	 */
	let {
		children,
		class: className = '',
		'aria-label': ariaLabelProp,
		maxItems,
		expanded = $bindable(false),
		onExpandedChange,
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
	let ids = $state<string[]>([]);

	// Fewer than two in view would hide the current page, or the root of the site.
	const limit = $derived(maxItems === undefined ? Infinity : Math.max(2, Math.floor(maxItems)));
	const collapsed = $derived(!expanded && ids.length > limit);
	// The folded middle: after the first item, before the last `limit - 1`.
	const hiddenEnd = $derived(collapsed ? ids.length - (limit - 1) : 0);
	const hiddenCount = $derived(collapsed ? hiddenEnd - 1 : 0);

	async function expand() {
		if (expanded) return;
		expanded = true;
		onExpandedChange?.(true);
		// The button that had the focus is gone: the first page that came into view takes it.
		await tick();
		const items = Array.from(
			navRef?.querySelectorAll<HTMLElement>('[data-breadcrumbs-item]') ?? []
		).slice(1);
		for (const item of items) {
			const target = item.querySelector<HTMLElement>('a[href], button, [tabindex]');
			if (target) {
				target.focus();
				return;
			}
		}
	}

	const context: BreadcrumbsContext = {
		get count() {
			return ids.length;
		},
		get maxItems() {
			return limit;
		},
		get collapsed() {
			return collapsed;
		},
		get hiddenCount() {
			return hiddenCount;
		},
		register(id) {
			ids = [...ids, id];
			return () => {
				ids = ids.filter((candidate) => candidate !== id);
			};
		},
		isHidden(id) {
			if (!collapsed) return false;
			const index = ids.indexOf(id);
			return index > 0 && index < hiddenEnd;
		},
		expand
	};

	setBreadcrumbsContext(context);

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
	data-collapsed={collapsed || undefined}
>
	{@render children?.()}
</nav>
