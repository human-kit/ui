<script lang="ts" generics="T extends object = object">
	import { untrack, type Snippet } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { dev } from '../../internal/environment';
	import {
		setComboBoxContext,
		type ComboBoxContext,
		type ComboBoxFilter,
		type ComboBoxItemActionRegistration,
		type ComboBoxItemActionSource
	} from './context';
	import type { ListBoxContext } from '../../listbox/root/context';
	import { useVirtualFocus } from '../../hooks/use-virtual-focus.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type ComboBoxProps<T> = {
		/** Stable ID used to generate internal ARIA IDs (recommended for SSR). */
		id?: string;
		disabled?: boolean;
		pending?: boolean;
		readonly?: boolean;
		/** Selected value(s). Single value for single mode, array for multiple mode. Can be bound with bind:value */
		value?: string | number | null | (string | number)[];
		defaultValue?: string | number | null | (string | number)[];
		/** Current input value. Can be bound with bind:inputValue */
		inputValue?: string;
		defaultInputValue?: string;
		selectionBehavior?: 'toggle' | 'replace';
		selectionMode?: 'single' | 'multiple';
		/** Whether to close popover after selection. Default: true for single, false for multiple */
		closeOnSelect?: boolean;
		/** Whether the popover is open. Can be bound with bind:open */
		open?: boolean;
		/** How the popover opens: 'focus' | 'input' | 'press'. Default: 'press' */
		trigger?: 'focus' | 'input' | 'press';
		/** Function used to filter items locally. Set to null to disable local filtering. */
		filter?: ComboBoxFilter | null;
		/** Whether items with onAction should participate in local filtering. */
		filterActionItems?: boolean;
		onInputChange?: (value: string) => void;
		onOpenChange?: (open: boolean) => void;
		onChange?: (value: string | number | null | (string | number)[]) => void;
		/** Optional: Array of items. Used internally to resolve selected labels before options mount. */
		items?: T[];
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
		disabled = false,
		pending = false,
		readonly = false,
		value = $bindable(),
		defaultValue,
		inputValue = $bindable(),
		defaultInputValue = '',
		selectionBehavior,
		selectionMode = 'single',
		closeOnSelect,
		open: openProp = $bindable(),
		trigger = 'press',
		filter = defaultComboBoxFilter,
		filterActionItems = true,
		onInputChange,
		onOpenChange,
		onChange,
		items,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby
	}: ComboBoxProps<T> = $props();

	function defaultComboBoxFilter(textValue: string, inputValue: string) {
		return textValue.toLowerCase().includes(inputValue.trim().toLowerCase());
	}

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

	// Use virtual focus hook for navigation
	const navigation = useVirtualFocus({
		instanceId,
		containerRef: () => listboxRef
	});

	// Persistent label of the selected item (for restore on blur/escape)
	let selectedLabel: string = $state('');

	// Persistent labels for selected items in multiple mode (not cleared on unregister)
	const selectedLabels = new SvelteMap<string | number, string>();

	// Virtual focus for tag navigation in multiple mode
	let focusedTagId: string | number | null = $state(null);
	let focusWithin = $state(false);
	let focusVisible = $state(false);
	let popoverPointerDownPending = $state(false);
	let shouldCloseOnEscapeState = $state(true);
	let shouldCloseOnBlurState = $state(true);
	const itemActions = new SvelteMap<string | number, ComboBoxItemActionRegistration>();

	// Visible items (including disabled-but-visible ones). Kept separately from
	// the navigation registration, which only tracks enabled items, so that
	// ComboBox.Status reflects what is actually on screen.
	const visibleItemIds = new SvelteSet<string | number>();

	// Flag to control whether inputValue should be used for filtering
	// When false, all items are shown regardless of inputValue
	let shouldFilter: boolean = $state(true);

	// Dev-mode prop validation warnings
	if (dev) {
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

	$effect(() => {
		if (selectionMode === 'single' && value === undefined && defaultValue === undefined) {
			value = null;
		}
	});

	function parseSelection(
		val: string | number | null | (string | number)[] | undefined
	): Set<string | number> {
		if (val == null) return new Set();
		if (Array.isArray(val)) return new Set(val);
		return new Set([val]);
	}

	// Convert internal Set back to external value based on selectionMode
	function toExternalValue(
		internalSet: Set<string | number>
	): string | number | null | (string | number)[] {
		if (selectionMode === 'single') {
			const arr = Array.from(internalSet);
			return arr.length > 0 ? arr[0] : null;
		}
		return Array.from(internalSet);
	}

	function isItemRecord(item: unknown): item is Record<string, unknown> {
		return typeof item === 'object' && item !== null;
	}

	function getInternalItemValue(item: T) {
		if (!isItemRecord(item)) return undefined;

		const id = item.id;
		if (typeof id === 'string' || typeof id === 'number') return id;

		const value = item.value;
		if (typeof value === 'string' || typeof value === 'number') return value;

		return undefined;
	}

	function getInternalItemTextValue(item: T) {
		if (!isItemRecord(item)) return undefined;

		const textValue = item.textValue;
		if (typeof textValue === 'string') return textValue;

		const name = item.name;
		if (typeof name === 'string') return name;

		const label = item.label;
		if (typeof label === 'string') return label;

		const value = getInternalItemValue(item);
		return value === undefined ? undefined : String(value);
	}

	function getItemLabelByValue(selectedId: string | number) {
		const selectedItem = items?.find((item) => getInternalItemValue(item) === selectedId);
		return selectedItem ? getInternalItemTextValue(selectedItem) : undefined;
	}

	function getInitialSelection() {
		return parseSelection(value !== undefined ? value : defaultValue);
	}

	function getInitialInputValue() {
		if (defaultInputValue) return defaultInputValue;
		if (selectionMode !== 'single') return '';

		const selectedId = Array.from(getInitialSelection())[0];
		return selectedId === undefined ? '' : (getItemLabelByValue(selectedId) ?? '');
	}

	// Use functions to capture initial values only (not reactive).
	let inputValueInternal = $state(getInitialInputValue());
	let selectedInternal = $state<Set<string | number>>((() => parseSelection(defaultValue))());

	// Reactive controlled mode checks - if prop changes from undefined to defined, behavior updates
	const isOpenControlled = $derived(openProp !== undefined);
	const isInputControlled = $derived(inputValue !== undefined);
	const isSelectionControlled = $derived(value !== undefined);

	const currentIsOpen = $derived(isOpenControlled ? openProp! : isOpenInternal);
	const currentInputValue = $derived(isInputControlled ? inputValue! : inputValueInternal);
	const currentSelection = $derived(
		isSelectionControlled ? parseSelection(value) : selectedInternal
	);

	// Input value used for filtering - empty when shouldFilter is false
	const filterValue = $derived(shouldFilter ? currentInputValue : '');

	function setIsOpen(open: boolean) {
		// No-op guard: prevents duplicate onOpenChange notifications when close
		// is requested twice (e.g. Escape closing and then blur handling).
		if (open === currentIsOpen) return;
		isOpenInternal = open;
		openProp = open; // Update bindable prop
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
			selectedInternal = emptySelection;
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

	function syncInputValue(val: string, options?: { notifyInputChange?: boolean }) {
		inputValueInternal = val;
		inputValue = val;

		if (options?.notifyInputChange ?? true) {
			onInputChange?.(val);
		}
	}

	function getSelectedItemLabel(selectedId: string | number) {
		const registeredLabel = navigation.itemLabels.get(selectedId);
		if (registeredLabel) return registeredLabel;

		return getItemLabelByValue(selectedId);
	}

	$effect(() => {
		if (selectionMode !== 'single') return;

		const selectedId = Array.from(currentSelection)[0];
		if (selectedId === undefined) {
			const previousSelectedLabel = selectedLabel;
			selectedLabel = '';

			if (
				!isInputControlled &&
				previousSelectedLabel &&
				currentInputValue === previousSelectedLabel
			) {
				syncInputValue('', { notifyInputChange: false });
			}

			return;
		}

		const label = getSelectedItemLabel(selectedId);
		if (!label) return;

		const previousSelectedLabel = selectedLabel;
		const shouldSyncInput =
			!isInputControlled &&
			(currentInputValue === '' || currentInputValue === previousSelectedLabel);

		selectedLabel = label;

		if (shouldSyncInput) {
			shouldFilter = false;
			if (currentInputValue !== label) {
				syncInputValue(label, { notifyInputChange: false });
			}
		}
	});

	function selectItem(id: string | number, label: string) {
		let newSelection: Set<string | number>;

		if (selectionMode === 'single') {
			newSelection = new Set([id]);
			shouldFilter = false;
			// Save the label persistently for restore on blur/escape
			selectedLabel = label;
			// Keep the selected label visible in the input without re-triggering
			// external filtering during the popover close animation.
			syncInputValue(label, { notifyInputChange: false });
			if (effectiveCloseOnSelect) {
				closePopover(true); // Close and keep focus on input
			}
		} else {
			const isTogglingOff = effectiveSelectionBehavior === 'toggle' && currentSelection.has(id);

			if (isTogglingOff) {
				newSelection = new Set(
					Array.from(currentSelection).filter((selectedId) => selectedId !== id)
				);
				// Remove from persistent labels
				selectedLabels.delete(id);
			} else {
				newSelection = new Set([...currentSelection, id]);
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

		selectedInternal = newSelection;
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
		const newSelection = new Set(
			Array.from(currentSelection).filter((selectedId) => selectedId !== id)
		);
		// Remove from persistent labels
		selectedLabels.delete(id);

		selectedInternal = newSelection;
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

		selectedInternal = emptySelection;
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

	function openPopover(options?: { reason?: 'input' | 'manual' }) {
		if (!disabled && !readonly) {
			// Don't open if triggerRef is not set yet (prevents race condition with focus trap)
			if (!triggerRef) {
				return;
			}
			// When the open is caused by typing, the user is actively filtering:
			// keep the filter they just started and don't move focus to the
			// previous selection.
			const openedByTyping = options?.reason === 'input';
			// If opening with a selection, disable filtering to show all options
			if (!openedByTyping) {
				if (currentSelection.size > 0 && selectionMode === 'single') {
					shouldFilter = false;
				} else {
					shouldFilter = true;
				}
			}
			setIsOpen(true);
			// Auto-focus the selected item when opening with a selection
			// This way the first arrow key press will navigate from the selection
			if (!openedByTyping && currentSelection.size > 0 && selectionMode === 'single') {
				const selectedId = Array.from(currentSelection)[0];
				navigation.setFocused(selectedId);
			}
		}
	}

	function closePopover(refocusInput = false) {
		// setIsOpen(false) already clears the virtual focus and any pending
		// direction. Item registration follows the item mount cycle (items stay
		// mounted through the exit animation and unregister on destroy), so we
		// must not wipe itemIds here or a quick reopen would leave navigation
		// without registered items.
		setIsOpen(false);
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

	function syncFocusWithin() {
		focusWithin =
			!!wrapperRef && !!document.activeElement && wrapperRef.contains(document.activeElement);
		if (!focusWithin) {
			focusVisible = false;
			// Clean up stale data-focused/data-focus-visible that Popover.Root's
			// focus-state module may have set imperatively on the wrapper (the
			// wrapper is briefly used as triggerRef before the input overrides it).
			if (wrapperRef) {
				delete wrapperRef.dataset.focused;
				delete wrapperRef.dataset.focusVisible;
			}
		}
	}

	function handleFocusIn(event: FocusEvent) {
		focusWithin = true;
		focusVisible = shouldShowFocusVisible(event.target as HTMLElement | null);
	}

	function handleFocusOut() {
		queueMicrotask(syncFocusWithin);
	}

	function setFocusVisibleState(visible: boolean) {
		focusVisible = visible && focusWithin;
	}

	// Use navigation hook methods for keyboard navigation
	function selectFocusedItem() {
		if (navigation.focusedId !== null) {
			if (listboxCtxRef?.isDisabled(navigation.focusedId)) {
				return;
			}
			if (activateItemAction(navigation.focusedId, 'keyboard')) {
				return;
			}
			const label = navigation.itemLabels.get(navigation.focusedId) ?? String(navigation.focusedId);
			selectItem(navigation.focusedId, label);
		}
	}

	function registerItemAction(id: string | number, registration: ComboBoxItemActionRegistration) {
		itemActions.set(id, registration);
	}

	function unregisterItemAction(id: string | number) {
		itemActions.delete(id);
	}

	function activateItemAction(id: string | number, source: ComboBoxItemActionSource) {
		if (disabled) return false;

		const action = itemActions.get(id);
		if (!action) return false;

		const details = {
			id,
			textValue: action.textValue,
			inputValue: currentInputValue,
			source
		};

		if (action.closeOnAction) {
			closePopover(true);
		}

		action.onAction(details);
		return true;
	}

	/**
	 * Handle input blur or escape - restore selection label or clear if no selection
	 */
	function consumePopoverPointerDown() {
		if (!popoverPointerDownPending) return false;
		popoverPointerDownPending = false;
		return true;
	}

	function handleInputBlur(event?: FocusEvent) {
		// Clear tag virtual focus
		focusedTagId = null;

		const nextFocusedElement = event?.relatedTarget;
		const isMovingFocusWithinCombobox =
			nextFocusedElement instanceof Node &&
			((wrapperRef?.contains(nextFocusedElement) ?? false) ||
				(listboxRef?.contains(nextFocusedElement) ?? false));

		if (isMovingFocusWithinCombobox || consumePopoverPointerDown()) {
			return;
		}

		if (!shouldCloseOnBlurState) {
			return;
		}
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
				syncInputValue(selectedLabel, { notifyInputChange: false });
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled) return;
		// Ignore keystrokes that are part of an IME composition (e.g. CJK input)
		// so Enter/arrows don't select items or navigate mid-composition.
		if (event.isComposing || event.keyCode === 229) return;
		trackInteractionModality(event, event.target as HTMLElement | null);

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
				event.preventDefault();
				if (!currentIsOpen) {
					openPopover();
					if (currentSelection.size === 0 || selectionMode !== 'single') {
						navigation.setPendingDirection('first');
					}
					break;
				}
				if (navigation.focusedId !== null) {
					selectFocusedItem();
				}
				break;
			case 'Escape':
				if (currentIsOpen && shouldCloseOnEscapeState) {
					closePopover(true); // Keep focus on input after Escape
					// Stop propagation so parent dialogs don't also close
					event.stopPropagation();
					event.stopImmediatePropagation();
					handleInputBlur();
					// Escape is a keyboard-only path, so focus-visible remains enabled for the input.
					focusVisible = true;
					event.preventDefault();
				}
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
			return disabled;
		},
		get isPending() {
			return pending;
		},
		get isFocusVisible() {
			return focusVisible;
		},
		get shouldCloseOnEscape() {
			return shouldCloseOnEscapeState;
		},
		get shouldCloseOnBlur() {
			return shouldCloseOnBlurState;
		},
		get isReadOnly() {
			return readonly;
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
		get filter() {
			return filter;
		},
		get filterActionItems() {
			return filterActionItems;
		},
		get focusedItemId() {
			return navigation.focusedId;
		},
		get itemIds() {
			return navigation.itemIds;
		},
		get visibleCount() {
			return visibleItemIds.size;
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
		unregisterItem: (id) => {
			navigation.unregister(id);
			unregisterItemAction(id);
		},
		registerVisibleItem: (id) => {
			visibleItemIds.add(id);
		},
		unregisterVisibleItem: (id) => {
			visibleItemIds.delete(id);
		},
		registerItemAction,
		unregisterItemAction,
		activateItemAction,
		handleKeydown,
		handleInputBlur,
		setFocusVisible: setFocusVisibleState,
		get focusedTagId() {
			return focusedTagId;
		},
		setFocusedTagId: (id: string | number | null) => {
			focusedTagId = id;
		},
		markPopoverPointerDown: () => {
			popoverPointerDownPending = true;
			// The marker only needs to survive the mousedown -> blur window.
			// Clear it on the next pointerup so item clicks that prevent the blur
			// (preventDefault) don't leave a stale flag that would swallow a
			// later, unrelated blur (e.g. Tab-out after the click).
			window.addEventListener(
				'pointerup',
				() => {
					popoverPointerDownPending = false;
				},
				{ once: true, capture: true }
			);
		},
		consumePopoverPointerDown,
		setShouldCloseOnEscape: (value: boolean) => {
			shouldCloseOnEscapeState = value;
		},
		setShouldCloseOnBlur: (value: boolean) => {
			shouldCloseOnBlurState = value;
		}
	};

	setComboBoxContext(ctx);
</script>

<div
	bind:this={wrapperRef}
	role="group"
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	aria-busy={pending ? 'true' : undefined}
	class={className}
	data-combobox
	data-focused={focusWithin || undefined}
	data-disabled={disabled || undefined}
	data-pending={pending || undefined}
	data-readonly={readonly || undefined}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={focusVisible || undefined}
	use:setWrapperAsTrigger
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
>
	{#if children}
		{@render children()}
	{/if}
</div>
