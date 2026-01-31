<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { setComboBoxContext, type ComboBoxContext } from './context';
	import type { ListBoxContext } from '$lib/components/listbox/root/context';
	import { useVirtualFocus } from '$lib/hooks/use-virtual-focus.svelte';

	type ComboBoxProps<T> = {
		isDisabled?: boolean;
		isReadOnly?: boolean;
		/** Selected value(s). Single value for single mode, array for multiple mode. Can be bound with bind:value */
		value?: string | number | (string | number)[];
		defaultValue?: string | number | (string | number)[];
		/** Current input value. Can be bound with bind:inputValue */
		inputValue?: string;
		defaultInputValue?: string;
		selectionBehavior?: 'toggle' | 'replace';
		selectionMode?: 'single' | 'multiple';
		/** Whether the popover is open. Can be bound with bind:isOpen */
		isOpen?: boolean;
		/** How the popover opens: 'focus' | 'input' | 'press'. Default: 'press' */
		trigger?: 'focus' | 'input' | 'press';
		onInputChange?: (value: string) => void;
		onOpenChange?: (open: boolean) => void;
		onChange?: (value: string | number | (string | number)[] | undefined) => void;
		/** Optional: Array of items for dynamic rendering */
		items?: T[];
		/** Optional: Snippet to render each item (used with items prop) */
		renderItem?: Snippet<[T]>;
		children?: Snippet;
		class?: string;
	};

	let {
		isDisabled = false,
		isReadOnly = false,
		value = $bindable(),
		defaultValue,
		inputValue = $bindable(),
		defaultInputValue = '',
		selectionBehavior,
		selectionMode = 'single',
		isOpen = $bindable(),
		trigger = 'press',
		onInputChange,
		onOpenChange,
		onChange,
		items,
		renderItem,
		children,
		class: className = ''
	}: ComboBoxProps<T> = $props();

	// Track if selectionBehavior was explicitly passed (for dev warning)
	const selectionBehaviorExplicit = $derived(selectionBehavior !== undefined);
	// Apply default if not provided
	const effectiveSelectionBehavior = $derived(selectionBehavior ?? 'toggle');

	// Generate unique instance ID for ARIA attributes
	const instanceId = crypto.randomUUID().slice(0, 8);

	let wrapperRef: HTMLElement | null = $state(null);
	let inputRef: HTMLElement | null = $state(null);
	let triggerRef: HTMLElement | null = $state(null);
	let listboxCtxRef: ListBoxContext | null = $state(null);
	let listboxRef: HTMLElement | null = $state(null);

	let isOpenInternal = $state(false);
	// Use function to capture initial value only (not reactive)
	let inputValueInternal = $state((() => defaultInputValue)());
	let selectedInternal = $state<Set<string | number>>((() => parseSelection(defaultValue))());

	// Use virtual focus hook for navigation
	const navigation = useVirtualFocus({
		instanceId,
		containerRef: () => listboxRef
	});

	// Persistent label of the selected item (for restore on blur/escape)
	let selectedLabel: string = $state('');

	// Flag to control whether inputValue should be used for filtering
	// When false, all items are shown regardless of inputValue
	let shouldFilter: boolean = $state(true);

	// Dev-mode prop validation warnings
	if (import.meta.env.DEV) {
		$effect(() => {
			// Only warn if user explicitly passed selectionBehavior="toggle"
			if (
				selectionBehaviorExplicit &&
				effectiveSelectionBehavior === 'toggle' &&
				selectionMode === 'single'
			) {
				console.warn(
					'[ComboBox]: selectionBehavior="toggle" has no effect with selectionMode="single". ' +
						'Toggle behavior is only meaningful for multiple selection.'
				);
			}
			if (value !== undefined && defaultValue !== undefined) {
				console.warn(
					'[ComboBox]: Both "value" and "defaultValue" are provided. ' +
						'Use "value" for controlled mode or "defaultValue" for uncontrolled mode, not both.'
				);
			}
		});
	}

	function parseSelection(
		val: string | number | (string | number)[] | undefined
	): Set<string | number> {
		if (val === undefined) return new Set();
		if (Array.isArray(val)) return new Set(val);
		return new Set([val]);
	}

	// Convert internal Set back to external value based on selectionMode
	function toExternalValue(
		internalSet: Set<string | number>
	): string | number | (string | number)[] | undefined {
		if (selectionMode === 'single') {
			const arr = Array.from(internalSet);
			return arr.length > 0 ? arr[0] : undefined;
		}
		return Array.from(internalSet);
	}

	// Reactive controlled mode checks - if prop changes from undefined to defined, behavior updates
	const isOpenControlled = $derived(isOpen !== undefined);
	const isInputControlled = $derived(inputValue !== undefined);
	const isSelectionControlled = $derived(value !== undefined);

	const currentIsOpen = $derived(isOpenControlled ? isOpen! : isOpenInternal);
	const currentInputValue = $derived(isInputControlled ? inputValue! : inputValueInternal);
	const currentSelection = $derived(
		isSelectionControlled ? parseSelection(value) : selectedInternal
	);

	// Input value used for filtering - empty when shouldFilter is false
	const filterValue = $derived(shouldFilter ? currentInputValue : '');

	function setIsOpen(open: boolean) {
		isOpenInternal = open;
		isOpen = open; // Update bindable prop
		onOpenChange?.(open);
		// Reset focus and pending when closing
		if (!open) {
			navigation.setFocused(null);
			navigation.setPendingDirection(null);
		}
	}

	function setInputValueHandler(val: string) {
		inputValueInternal = val;
		inputValue = val; // Update bindable prop
		onInputChange?.(val); // Notify parent of input change
		// Reset focus when filter changes (user typing)
		navigation.setFocused(null);

		// Re-enable filtering when user starts typing/editing
		if (!shouldFilter) {
			shouldFilter = true;
		}

		// Instant deselection when input is cleared
		if (val.trim() === '' && currentSelection.size > 0) {
			const emptySelection = new Set<string | number>();
			if (isSelectionControlled) {
				onChange?.(toExternalValue(emptySelection));
			} else {
				selectedInternal = emptySelection;
				onChange?.(toExternalValue(emptySelection));
			}
			value = toExternalValue(emptySelection);
			selectedLabel = '';
		}
	}

	function selectItem(id: string | number, label: string) {
		const newSelection = new Set(currentSelection);

		if (selectionMode === 'single') {
			newSelection.clear();
			newSelection.add(id);
			// Save the label persistently for restore on blur/escape
			selectedLabel = label;
			// Update input directly without triggering deselection
			inputValueInternal = label;
			inputValue = label;
			onInputChange?.(label);
			closePopover(true); // Close and keep focus on input
		} else {
			if (effectiveSelectionBehavior === 'toggle' && newSelection.has(id)) {
				newSelection.delete(id);
			} else {
				newSelection.add(id);
			}
			// Clear input after selection in multiple mode (to continue searching)
			inputValueInternal = '';
			inputValue = '';
			onInputChange?.('');
		}

		if (isSelectionControlled) {
			onChange?.(toExternalValue(newSelection));
		} else {
			selectedInternal = newSelection;
			onChange?.(toExternalValue(newSelection));
		}
		// Update bindable value
		value = toExternalValue(newSelection);
	}

	function removeItem(id: string | number) {
		const newSelection = new Set(currentSelection);
		newSelection.delete(id);

		if (isSelectionControlled) {
			onChange?.(toExternalValue(newSelection));
		} else {
			selectedInternal = newSelection;
			onChange?.(toExternalValue(newSelection));
		}
		value = toExternalValue(newSelection);

		// Clear selectedLabel if we removed the last item
		if (newSelection.size === 0) {
			selectedLabel = '';
		}
	}

	function clearSelection() {
		const emptySelection = new Set<string | number>();

		if (isSelectionControlled) {
			onChange?.(toExternalValue(emptySelection));
		} else {
			selectedInternal = emptySelection;
			onChange?.(toExternalValue(emptySelection));
		}
		value = toExternalValue(emptySelection);
		selectedLabel = '';

		// Also clear the input
		inputValueInternal = '';
		inputValue = '';
		onInputChange?.('');
	}

	function openPopover() {
		if (!isDisabled && !isReadOnly) {
			// Don't open if triggerRef is not set yet (prevents race condition with focus trap)
			if (!triggerRef) {
				return;
			}
			// If opening with a selection, disable filtering to show all options
			if (currentSelection.size > 0 && selectionMode === 'single') {
				shouldFilter = false;
				// Only reset filter if user didn't type (input matches selection)
				if (currentInputValue === selectedLabel) {
					onInputChange?.('');
				}
				// Otherwise user typed, keep their filter
			}
			setIsOpen(true);
			// Auto-focus the selected item when opening with a selection
			// This way the first arrow key press will navigate from the selection
			if (currentSelection.size > 0 && selectionMode === 'single') {
				const selectedId = Array.from(currentSelection)[0];
				navigation.setFocused(selectedId);
			}
		}
	}

	function closePopover(refocusInput = false) {
		setIsOpen(false);
		// Reset navigation state
		navigation.reset();
		// Re-enable filtering for next open
		shouldFilter = true;
		// Only refocus input when explicitly requested (e.g., after selection)
		// Never refocus in focus mode to prevent re-opening
		if (refocusInput && trigger !== 'focus') {
			inputRef?.focus();
		}
	}

	function togglePopover() {
		if (currentIsOpen) {
			closePopover();
		} else {
			openPopover();
		}
	}

	// Use navigation hook methods for keyboard navigation
	function selectFocusedItem() {
		if (navigation.focusedId !== null) {
			const label = navigation.itemLabels.get(navigation.focusedId) ?? String(navigation.focusedId);
			selectItem(navigation.focusedId, label);
		}
	}

	/**
	 * Handle input blur or escape - restore selection label or clear if no selection
	 */
	function handleInputBlur() {
		// Close popover first to prevent flash of options when clearing input
		closePopover();

		// If there's no selection and input has content, clear it (for Escape)
		if (currentSelection.size === 0) {
			if (currentInputValue.trim() !== '') {
				inputValueInternal = '';
				inputValue = '';
				onInputChange?.('');
			}
			return;
		}

		// If there's a selection, restore its label (using persistent selectedLabel)
		if (currentSelection.size > 0 && selectionMode === 'single' && selectedLabel) {
			if (selectedLabel !== currentInputValue) {
				// Restore the selected label
				inputValueInternal = selectedLabel;
				inputValue = selectedLabel;
				onInputChange?.(selectedLabel);
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isDisabled) return;

		switch (event.key) {
			case 'ArrowDown':
				if (!currentIsOpen) {
					openPopover();
					// If there's no selection, set pending direction to focus first item
					if (currentSelection.size === 0 || selectionMode !== 'single') {
						navigation.setPendingDirection('first');
					}
					// If there's a selection, openPopover already focused it
				} else {
					navigation.next();
				}
				event.preventDefault();
				break;
			case 'ArrowUp':
				if (!currentIsOpen) {
					openPopover();
					// If there's no selection, set pending direction to focus last item
					if (currentSelection.size === 0 || selectionMode !== 'single') {
						navigation.setPendingDirection('last');
					}
					// If there's a selection, openPopover already focused it
				} else {
					navigation.previous();
				}
				event.preventDefault();
				break;
			case 'ArrowLeft':
			case 'ArrowRight':
				if (currentIsOpen) {
					// Reset focus when using horizontal arrows, but allow cursor movement
					navigation.setFocused(null);
					// Don't prevent default - let the cursor move in the input
				}
				break;
			case 'Home':
				if (currentIsOpen) {
					navigation.first();
					event.preventDefault();
				}
				break;
			case 'End':
				if (currentIsOpen) {
					navigation.last();
					event.preventDefault();
				}
				break;
			case 'PageUp':
				if (currentIsOpen) {
					navigation.pageUp();
					event.preventDefault();
				}
				break;
			case 'PageDown':
				if (currentIsOpen) {
					navigation.pageDown();
					event.preventDefault();
				}
				break;
			case 'Enter':
				if (currentIsOpen && navigation.focusedId !== null) {
					selectFocusedItem();
					event.preventDefault();
				}
				break;
			case 'Escape':
				if (currentIsOpen) {
					closePopover(true); // Keep focus on input after Escape
					// Stop propagation so parent dialogs don't also close
					event.stopPropagation();
					event.stopImmediatePropagation();
				}
				handleInputBlur();
				event.preventDefault();
				break;
		}
	}

	function setWrapperAsTrigger(node: HTMLElement) {
		triggerRef = node;
		return {};
	}

	const ctx: ComboBoxContext<T> = {
		get instanceId() {
			return instanceId;
		},
		get inputValue() {
			return filterValue; // Returns empty string when shouldFilter is false
		},
		get displayValue() {
			return currentInputValue; // Always returns the actual input value
		},
		get isOpen() {
			return currentIsOpen;
		},
		get inputRef() {
			return inputRef;
		},
		get triggerRef() {
			return triggerRef;
		},
		get selectedValue() {
			return currentSelection;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
		},
		get selectionMode() {
			return selectionMode;
		},
		get trigger() {
			return trigger;
		},
		get shouldFilter() {
			return shouldFilter;
		},
		get focusedItemId() {
			return navigation.focusedId;
		},
		get itemIds() {
			return navigation.itemIds;
		},
		get itemLabels() {
			return navigation.itemLabels;
		},
		get pendingFocusDirection() {
			return navigation.pendingFocusDirection;
		},
		get listboxCtx() {
			return listboxCtxRef;
		},
		get listboxRef() {
			return listboxRef;
		},
		get items() {
			return items;
		},
		get renderItem() {
			return renderItem;
		},
		setInputRef: (el) => {
			inputRef = el;
		},
		setTriggerRef: (el) => {
			triggerRef = el;
		},
		setListboxCtx: (ctx) => {
			listboxCtxRef = ctx;
		},
		setListboxRef: (el) => {
			listboxRef = el;
		},
		setInputValue: setInputValueHandler,
		open: openPopover,
		close: closePopover,
		toggle: togglePopover,
		select: selectItem,
		removeItem,
		clearSelection,
		onOpenChange: setIsOpen,
		setFocusedItemId: navigation.setFocused,
		registerItem: navigation.register,
		unregisterItem: navigation.unregister,
		handleKeydown,
		handleInputBlur
	};

	setComboBoxContext(ctx);
</script>

<div
	bind:this={wrapperRef}
	role="group"
	class={className}
	data-combobox
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	use:setWrapperAsTrigger
>
	{#if children}
		{@render children()}
	{/if}
</div>
