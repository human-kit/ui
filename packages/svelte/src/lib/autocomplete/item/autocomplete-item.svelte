<script lang="ts" module>
	export const AUTOCOMPLETE_ITEM_CONTEXT_KEY = Symbol.for('autocomplete-item');

	export type AutocompleteItemContext = {
		id: string | number;
	};
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { onDestroy, setContext, untrack } from 'svelte';
	import ListBoxItem from '../../listbox/item/listbox-item.svelte';
	import { useAutocompleteContext } from '../root/context';

	/**
	 * Autocomplete.Item wraps ListBox.Item and adds Autocomplete behavior:
	 * - Local filtering based on the search query (hidden items are removed).
	 * - Virtual focus (aria-activedescendant pattern) driven by the root.
	 * - Unique ID scoped by instanceId for multiple autocompletes on a page.
	 */
	type AutocompleteItemProps = Omit<
		ComponentProps<typeof ListBoxItem>,
		// Internal override props controlled by Autocomplete.Item
		| 'customId'
		| 'disableFocusHandling'
		| 'isFocusedOverride'
		| 'isFocusVisibleOverride'
		| 'onItemSelect'
		| 'onResolvedTextValue'
		| 'onItemHoverStart'
		| 'scrollOnFocus'
		| 'isParentDisabled'
	>;

	let { id, ...props }: AutocompleteItemProps = $props();

	const ctx = useAutocompleteContext();

	// Provide item context for child components like ItemIndicator.
	setContext<AutocompleteItemContext>(AUTOCOMPLETE_ITEM_CONTEXT_KEY, {
		get id() {
			return id;
		}
	});

	// Text value for filtering/display. Resolved from rendered content if omitted.
	let resolvedTextValue = $state<string | null>(untrack(() => props.textValue ?? null));
	const effectiveTextValue = $derived(resolvedTextValue ?? '');

	$effect(() => {
		if (props.textValue !== undefined) resolvedTextValue = props.textValue;
	});

	const query = $derived(ctx.inputValue);
	const isDisabled = $derived(Boolean(props.disabled) || ctx.isDisabled);

	// Visible when there is no query, filtering is disabled, the text value hasn't
	// resolved yet (keep visible until mount resolves it), or the filter matches.
	const isVisible = $derived(
		!query.trim() ||
			!effectiveTextValue ||
			ctx.filter === null ||
			ctx.filter(effectiveTextValue, query)
	);

	const isFocused = $derived(ctx.focusedItemId === id);
	const isFocusVisible = $derived(isFocused && ctx.isFocusVisible);
	const uniqueId = $derived(`autocomplete-item-${ctx.instanceId}-${id}`);

	let isRegistered = $state(false);

	// Register for navigation only while visible and enabled.
	$effect(() => {
		const visible = isVisible;
		const disabled = isDisabled;
		const label = effectiveTextValue || String(id);
		const itemId = id;

		if (visible && !disabled && !isRegistered) {
			ctx.registerItem(itemId, label);
			isRegistered = true;
		} else if ((!visible || disabled) && isRegistered) {
			ctx.unregisterItem(itemId);
			isRegistered = false;
		}
	});

	function handleResolvedTextValue(label: string) {
		if (!label) return;
		resolvedTextValue = label;
		if (isRegistered) ctx.registerItem(id, label);
	}

	onDestroy(() => {
		if (isRegistered) ctx.unregisterItem(id);
	});

	function handleSelect(itemId: string | number) {
		// Selection here is pointer-driven (click); clear the keyboard focus ring.
		ctx.setFocusVisible(false);
		ctx.setFocusedItemId(itemId);
		ctx.listboxCtx?.select(itemId);
		// Virtual-focus invariant: DOM focus must live on the input. If focus was lost
		// (e.g. the user clicked away and then picked an option), return it to the input
		// so keyboard navigation and typing keep working.
		ctx.focusInput();
	}
</script>

{#if isVisible}
	<ListBoxItem
		{id}
		{...props}
		textValue={props.textValue}
		customId={uniqueId}
		disableFocusHandling={true}
		isFocusedOverride={isFocused}
		isFocusVisibleOverride={isFocusVisible}
		onItemSelect={handleSelect}
		onResolvedTextValue={handleResolvedTextValue}
		scrollOnFocus={true}
		isParentDisabled={ctx.isDisabled}
	/>
{/if}
