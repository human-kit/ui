<script lang="ts" module>
	export const COMBOBOX_ITEM_CONTEXT_KEY = Symbol.for('combobox-item');

	export type ComboBoxItemContext = {
		id: string | number;
	};
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { untrack, onDestroy, setContext } from 'svelte';
	import ListBoxItem from '../../listbox/item/listbox-item.svelte';
	import { useComboBoxContext, type ComboBoxItemActionHandler } from '../root/context';

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
	> & {
		/** Called when this item is activated as an action instead of selected. */
		onAction?: ComboBoxItemActionHandler;
		/** Whether to close the popover after running onAction. */
		closeOnAction?: boolean;
	};

	let { id, onAction, closeOnAction = true, ...props }: ComboBoxListBoxItemProps = $props();

	const ctx = useComboBoxContext();

	// Provide item context for child components like ItemIndicator
	setContext<ComboBoxItemContext>(COMBOBOX_ITEM_CONTEXT_KEY, {
		get id() {
			return id;
		}
	});

	// Text value for filtering and display.
	// If textValue prop is omitted, resolve it from rendered content on mount.
	// svelte-ignore state_referenced_locally
	let resolvedTextValue = $state<string | null>(props.textValue ?? null);
	const effectiveTextValue = $derived(resolvedTextValue ?? '');

	$effect(() => {
		if (props.textValue !== undefined) {
			resolvedTextValue = props.textValue;
		}
	});

	const filterInput = $derived(ctx.inputValue);
	const isDisabled = $derived(Boolean(props.disabled) || ctx.isDisabled);
	const isActionItem = $derived(Boolean(onAction));

	// Automatic filtering: if text is not resolved yet, keep item visible until mount resolves it.
	const isVisible = $derived(
		(isActionItem && !ctx.filterActionItems) ||
			!filterInput.trim() ||
			!effectiveTextValue ||
			ctx.filter === null ||
			ctx.filter(effectiveTextValue, filterInput)
	);

	// Virtual focus from ComboBox context
	const isFocused = $derived(ctx.focusedItemId === id);
	const isFocusVisible = $derived(isFocused && ctx.isFocusVisible);

	// Generate unique ID using instanceId
	const uniqueId = $derived(`combobox-item-${ctx.instanceId}-${id}`);

	// Track registration state to avoid re-registering
	let isRegistered = $state(false);
	let isActionRegistered = $state(false);
	let isVisibleRegistered = $state(false);

	// Reactive registration: register when visible, unregister when hidden
	$effect(() => {
		const visible = isVisible;
		const disabled = isDisabled;
		const label = effectiveTextValue || String(id);
		const itemId = id;
		const action = onAction;
		const shouldClose = closeOnAction;

		untrack(() => {
			// Visible-item tracking includes disabled items so Status/Empty match
			// what is actually rendered on screen.
			if (visible && !isVisibleRegistered) {
				ctx.registerVisibleItem(itemId);
				isVisibleRegistered = true;
			} else if (!visible && isVisibleRegistered) {
				ctx.unregisterVisibleItem(itemId);
				isVisibleRegistered = false;
			}

			if (visible && !disabled) {
				// register() is idempotent for the id and refreshes the label map,
				// so re-running it keeps the navigation label in sync when a
				// dynamic `textValue` changes while the item stays registered.
				ctx.registerItem(itemId, label);
				isRegistered = true;
			} else if ((!visible || disabled) && isRegistered) {
				ctx.unregisterItem(itemId);
				isRegistered = false;
			}

			if (visible && !disabled && action) {
				ctx.registerItemAction(itemId, {
					textValue: label,
					onAction: action,
					closeOnAction: shouldClose
				});
				isActionRegistered = true;
			} else if (isActionRegistered) {
				ctx.unregisterItemAction(itemId);
				isActionRegistered = false;
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
		if (isActionRegistered && onAction) {
			ctx.registerItemAction(id, {
				textValue: label,
				onAction,
				closeOnAction
			});
		}
	}

	// Cleanup on component destroy - use onDestroy for clearer semantics
	onDestroy(() => {
		if (isRegistered) {
			ctx.unregisterItem(id);
		}
		if (isActionRegistered) {
			ctx.unregisterItemAction(id);
		}
		if (isVisibleRegistered) {
			ctx.unregisterVisibleItem(id);
		}
	});

	// Custom select handler that uses ComboBox context
	function handleSelect(itemId: string | number, label: string) {
		ctx.setFocusedItemId(itemId);
		if (ctx.activateItemAction(itemId, 'pointer')) {
			return;
		}
		ctx.select(itemId, label);
	}

	function handleHoverStart(itemId: string | number) {
		ctx.setFocusVisible(false);
		ctx.setFocusedItemId(itemId);
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
		onItemHoverStart={handleHoverStart}
		scrollOnFocus={true}
		isParentDisabled={ctx.isDisabled}
	/>
{/if}
