<script lang="ts" generics="T extends object = object">
	import type { ComponentProps, Snippet } from 'svelte';
	import { useAutocompleteContext } from '../root/context';
	import { ListBoxRoot as ListBox, type ListBoxContext } from '../../listbox';

	/**
	 * Autocomplete.List - The always-visible, filterable listbox.
	 *
	 * Wraps ListBox and owns selection: pass `selectionMode`, `value`,
	 * `defaultValue` and `onChange` here. Focus is handled virtually by the
	 * Autocomplete (the input keeps DOM focus), so `disableFocusHandling` is forced.
	 */
	type AutocompleteListProps = Omit<
		ComponentProps<typeof ListBox>,
		// Controlled internally by Autocomplete. The empty state is owned by
		// `Autocomplete.Empty`, so the ListBox's built-in placeholder is suppressed.
		'context' | 'element' | 'disableFocusHandling' | 'id' | 'items' | 'children' | 'emptyPlaceholder'
	> & {
		/** Optional items for dynamic rendering. */
		items?: Iterable<T>;
		/** Content of the list. Receives item in dynamic mode. */
		children?: Snippet<[T]> | Snippet;
	};

	let {
		'aria-label': ariaLabel = 'Options',
		children,
		items,
		...props
	}: AutocompleteListProps = $props();

	// Render nothing for the ListBox's built-in empty UI; `Autocomplete.Empty` is
	// the query-aware empty state. Cast to string so the value reads as a non-empty,
	// non-string placeholder (a snippet) that renders no content.
	const suppressEmptyPlaceholder = blankPlaceholder as unknown as string;

	const ctx = useAutocompleteContext();
	let listboxCtx: ListBoxContext | undefined = $state();
	let listboxElement: HTMLElement | undefined = $state();

	// Wire the inner ListBox context + element to the Autocomplete context so the
	// root can select the virtually-focused item and scope DOM queries.
	$effect(() => {
		if (listboxCtx) ctx.setListboxCtx(listboxCtx);
	});

	$effect(() => {
		ctx.setListboxRef(listboxElement ?? null);
	});
</script>

<!-- Suppress ListBox's built-in empty UI; Autocomplete.Empty owns the empty state. -->
{#snippet blankPlaceholder()}{/snippet}

<ListBox
	{...props}
	bind:context={listboxCtx}
	bind:element={listboxElement}
	id={`autocomplete-listbox-${ctx.instanceId}`}
	{items}
	{children}
	emptyPlaceholder={suppressEmptyPlaceholder}
	aria-label={ariaLabel}
	disableFocusHandling={true}
/>
