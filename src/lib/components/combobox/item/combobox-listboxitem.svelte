<script lang="ts" module>
	export const COMBOBOX_ITEM_CONTEXT_KEY = Symbol.for('combobox-item');

	export type ComboBoxItemContext = {
		id: string | number;
	};
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { untrack, onDestroy, setContext } from 'svelte';
	import ListBoxItem from '$lib/components/listbox/item/listbox-item.svelte';
	import { useComboBoxContext } from '../root/context';
	import { cn } from '$lib/utils/cn';

	/**
	 * ComboBox.ListBoxItem wraps ListBox.Item and provides ComboBox-specific behavior:
	 * - Virtual focus (aria-activedescendant pattern)
	 * - Unique ID with instanceId for multiple comboboxes
	 * - Registration with ComboBox context for navigation
	 * - Scroll on focus for keyboard navigation
	 * - Automatic filtering based on inputValue
	 */
	type ComboBoxListBoxItemProps = Omit<
		ComponentProps<typeof ListBoxItem>,
		// Internal override props that ComboBox.ListBoxItem controls
		| 'customId'
		| 'disableFocusHandling'
		| 'isFocusedOverride'
		| 'onItemSelect'
		| 'onResolvedTextValue'
		| 'scrollOnFocus'
		| 'isParentDisabled'
	>;

	let { id, class: className, ...props }: ComboBoxListBoxItemProps = $props();

	const ctx = useComboBoxContext();

	// Provide item context for child components like ItemIndicator
	setContext<ComboBoxItemContext>(COMBOBOX_ITEM_CONTEXT_KEY, {
		get id() {
			return id;
		}
	});

	// Text value for filtering and display.
	// If textValue prop is omitted, resolve it from rendered content on mount.
	let resolvedTextValue = $state<string | null>(props.textValue ?? null);
	const effectiveTextValue = $derived(resolvedTextValue ?? '');

	$effect(() => {
		if (props.textValue !== undefined) {
			resolvedTextValue = props.textValue;
		}
	});

	// Normalized input for filtering comparison
	const normalizedInput = $derived(ctx.inputValue.trim().toLowerCase());

	// Automatic filtering: if text is not resolved yet, keep item visible until mount resolves it.
	const isVisible = $derived(
		!normalizedInput || !effectiveTextValue || effectiveTextValue.toLowerCase().includes(normalizedInput)
	);

	// Virtual focus from ComboBox context
	const isFocused = $derived(ctx.focusedItemId === id);

	// Generate unique ID using instanceId
	const uniqueId = $derived(`combobox-item-${ctx.instanceId}-${id}`);

	// Track registration state to avoid re-registering
	let isRegistered = $state(false);

	// Reactive registration: register when visible, unregister when hidden
	$effect(() => {
		const visible = isVisible;
		const label = effectiveTextValue || String(id);
		const itemId = id;

		untrack(() => {
			if (visible && !isRegistered) {
				ctx.registerItem(itemId, label);
				isRegistered = true;
			} else if (!visible && isRegistered) {
				ctx.unregisterItem(itemId);
				isRegistered = false;
			}
		});
	});

	function handleResolvedTextValue(label: string) {
		if (!label) return;
		resolvedTextValue = label;
		// Update label map when already registered.
		if (isRegistered) {
			ctx.registerItem(id, label);
		}
	}

	// Cleanup on component destroy - use onDestroy for clearer semantics
	onDestroy(() => {
		if (isRegistered) {
			ctx.unregisterItem(id);
		}
	});

	// Custom select handler that uses ComboBox context
	function handleSelect(itemId: string | number, label: string) {
		ctx.select(itemId, label);
	}
</script>

<!--
	svelte-ignore a11y_interactive_supports_focus
	This element intentionally does not have tabindex because we use a "virtual focus" pattern.
	The ComboBox input maintains real DOM focus while aria-activedescendant points to the focused option.
	See: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
-->
{#if isVisible}
	<ListBoxItem
		{id}
		{...props}
		textValue={props.textValue}
		customId={uniqueId}
		disableFocusHandling={true}
		isFocusedOverride={isFocused}
		onItemSelect={handleSelect}
		onResolvedTextValue={handleResolvedTextValue}
		scrollOnFocus={true}
		isParentDisabled={ctx.isDisabled}
		class={cn(
			'cursor-pointer px-3 py-2 transition-colors outline-none',
			'data-focused:bg-accent data-hovered:bg-accent',
			'data-selected:bg-primary/10 data-selected:font-medium',
			'data-disabled:pointer-events-none data-disabled:opacity-50',
			className
		)}
	/>
{/if}
