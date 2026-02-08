<script lang="ts" generics="T extends object = object">
	import { untrack, type Snippet } from 'svelte';
	import { setComboBoxContext, type ComboBoxContext } from './context';
	import type { ListBoxContext } from '../../listbox/root/context';
	import { useVirtualFocus } from '../../hooks/use-virtual-focus.svelte';

	type ComboBoxProps<T> = {
		/** Stable ID used to generate internal ARIA IDs (recommended for SSR). */
		id?: string;
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
		/** Whether to close popover after selection. Default: true for single, false for multiple */
		closeOnSelect?: boolean;
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
		/** Accessible label for the combobox group */
		'aria-label'?: string;
		/** ID of element that labels this combobox group */
		'aria-labelledby'?: string;
	};

	const generatedInstanceId = $props.id();

	let {
		id: rootId,
		isDisabled = false,
		isReadOnly = false,
		value = $bindable(),
		defaultValue,
		inputValue = $bindable(),
		defaultInputValue = '',
		selectionBehavior,
		selectionMode = 'single',
		closeOnSelect,
		isOpen = $bindable(),
		trigger = 'press',
		onInputChange,
		onOpenChange,
		onChange,
		items,
		renderItem,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby
	}: ComboBoxProps<T> = $props();

	const instanceId = untrack(() => rootId) ?? generatedInstanceId;

	// Track if selectionBehavior was explicitly passed (for dev warning)
	const selectionBehaviorExplicit = $derived(selectionBehavior !== undefined);
	// Apply default if not provided
	const effectiveSelectionBehavior = $derived(selectionBehavior ?? 'toggle');
	// Default closeOnSelect based on selectionMode
	const effectiveCloseOnSelect = $derived(closeOnSelect ?? selectionMode === 'single');

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

	// Persistent labels for selected items in multiple mode (not cleared on unregister)
	let selectedLabels = $state(new Map<string | number, string>());

	// Virtual focus for tag navigation in multiple mode
	let focusedTagId: string | number | null = $state(null);

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
		// Clear tag virtual focus when typing
		focusedTagId = null;
		inputValueInternal = val;
		inputValue = val; // Update bindable prop
		onInputChange?.(val); // Notify parent of input change
		// Reset focus when filter changes (user typing)
		navigation.setFocused(null);

		// Re-enable filtering when user starts typing/editing
		if (!shouldFilter) {
			shouldFilter = true;
		}

		// Instant deselection when input is cleared (single mode only)
		// In multiple mode, selections are managed via tags, not input
		if (selectionMode === 'single' && val.trim() === '' && currentSelection.size > 0) {
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
			if (effectiveCloseOnSelect) {
				closePopover(true); // Close and keep focus on input
			}
		} else {
			if (effectiveSelectionBehavior === 'toggle' && newSelection.has(id)) {
				newSelection.delete(id);
				// Remove from persistent labels
				selectedLabels.delete(id);
			} else {
				newSelection.add(id);
				// Save label persistently for tags display
				selectedLabels.set(id, label);
			}
			// Clear input after selection in multiple mode (to continue searching)
			inputValueInternal = '';
			inputValue = '';
			onInputChange?.('');
			if (effectiveCloseOnSelect) {
				closePopover(true); // Close and keep focus on input
			}
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
		// If removing the focused tag, clear virtual focus
		if (focusedTagId === id) {
			focusedTagId = null;
		}
		const newSelection = new Set(currentSelection);
		newSelection.delete(id);
		// Remove from persistent labels
		selectedLabels.delete(id);

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
		// Clear tag virtual focus
		focusedTagId = null;
		// Close popover first to prevent flash of options when clearing input
		closePopover();

		// In multiple mode, always clear the input on blur
		if (selectionMode === 'multiple') {
			if (currentInputValue.trim() !== '') {
				inputValueInternal = '';
				inputValue = '';
				onInputChange?.('');
			}
			return;
		}

		// Single mode: If there's no selection and input has content, clear it
		if (currentSelection.size === 0) {
			if (currentInputValue.trim() !== '') {
				inputValueInternal = '';
				inputValue = '';
				onInputChange?.('');
			}
			return;
		}

		// If there's a selection, restore its label (using persistent selectedLabel)
		if (currentSelection.size > 0 && selectedLabel) {
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

		// Handle tag virtual focus navigation in multiple mode
		if (focusedTagId !== null && selectionMode === 'multiple') {
			const selectedIds = Array.from(currentSelection);
			const currentIndex = selectedIds.indexOf(focusedTagId);

			switch (event.key) {
				case 'ArrowLeft': {
					if (currentIndex > 0) {
						focusedTagId = selectedIds[currentIndex - 1];
					}
					event.preventDefault();
					return;
				}
				case 'ArrowRight': {
					if (currentIndex < selectedIds.length - 1) {
						focusedTagId = selectedIds[currentIndex + 1];
					} else {
						// Past last tag, return to input
						focusedTagId = null;
					}
					event.preventDefault();
					return;
				}
				case 'ArrowUp': {
					focusedTagId = null;
					if (!currentIsOpen) {
						openPopover();
						navigation.setPendingDirection('last');
					} else {
						navigation.previous();
					}
					event.preventDefault();
					return;
				}
				case 'ArrowDown': {
					focusedTagId = null;
					if (!currentIsOpen) {
						openPopover();
						navigation.setPendingDirection('first');
					} else {
						navigation.next();
					}
					event.preventDefault();
					return;
				}
				case 'Delete':
				case 'Backspace': {
					const prevId = currentIndex > 0 ? selectedIds[currentIndex - 1] : null;
					const nextId =
						currentIndex < selectedIds.length - 1 ? selectedIds[currentIndex + 1] : null;

					removeItem(focusedTagId);

					if (nextId !== null) {
						focusedTagId = nextId;
					} else if (prevId !== null) {
						focusedTagId = prevId;
					} else {
						focusedTagId = null;
					}
					event.preventDefault();
					return;
				}
				case 'Escape': {
					focusedTagId = null;
					break; // Fall through to normal escape handling
				}
				default: {
					// Character keys: clear tag focus, let character go to input
					if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
						focusedTagId = null;
						// Don't prevent default - character will be typed in input
						return;
					}
					break;
				}
			}
		}

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
				// In multiple mode, navigate to last tag when cursor is at start
				if (selectionMode === 'multiple' && currentSelection.size > 0) {
					const input = inputRef as HTMLInputElement | null;
					if (input && input.selectionStart === 0 && input.selectionEnd === 0) {
						// Close popover when navigating to tags
						if (currentIsOpen) {
							closePopover();
						}
						// Set virtual focus on last tag
						const selectedIds = Array.from(currentSelection);
						focusedTagId = selectedIds[selectedIds.length - 1];
						event.preventDefault();
						break;
					}
				}
				if (currentIsOpen) {
					// Reset focus when using horizontal arrows, but allow cursor movement
					navigation.setFocused(null);
					// Don't prevent default - let the cursor move in the input
				}
				break;
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
			case 'Backspace':
				// In multiple mode, remove last tag when input is empty
				if (selectionMode === 'multiple' && currentInputValue === '' && currentSelection.size > 0) {
					const lastId = Array.from(currentSelection).pop();
					if (lastId !== undefined) {
						removeItem(lastId);
					}
				}
				// Don't prevent default - let backspace work normally in input
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
		get selectedLabels() {
			return selectedLabels;
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
		handleInputBlur,
		get focusedTagId() {
			return focusedTagId;
		},
		setFocusedTagId: (id: string | number | null) => {
			focusedTagId = id;
		}
	};

	setComboBoxContext(ctx);
</script>

<div
	bind:this={wrapperRef}
	role="group"
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
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
