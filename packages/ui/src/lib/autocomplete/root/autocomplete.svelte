<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import {
		setAutocompleteContext,
		defaultAutocompleteFilter,
		type AutocompleteContext,
		type AutocompleteFilter
	} from './context';
	import type { ListBoxContext } from '../../listbox/root/context';
	import { useVirtualFocus } from '../../hooks/use-virtual-focus.svelte';

	type AutocompleteProps = {
		/** Stable ID used to generate internal ARIA IDs (recommended for SSR). */
		id?: string;
		disabled?: boolean;
		readonly?: boolean;
		/** Current search query. Can be bound with bind:inputValue. */
		inputValue?: string;
		/** Initial query for uncontrolled mode. */
		defaultInputValue?: string;
		/**
		 * Local filter function. Defaults to a case-insensitive "contains" match.
		 * Set to `null` to disable local filtering (e.g. when filtering server-side).
		 */
		filter?: AutocompleteFilter | null;
		/** Automatically highlight the first matching item as the query changes. */
		autoHighlight?: boolean;
		/** Called when the search query changes. */
		onInputChange?: (value: string) => void;
		children?: Snippet;
		class?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
	};

	let {
		id: rootId,
		disabled = false,
		readonly = false,
		inputValue = $bindable(),
		defaultInputValue = '',
		filter = defaultAutocompleteFilter,
		autoHighlight = true,
		onInputChange,
		children,
		class: className = '',
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		element = $bindable()
	}: AutocompleteProps & { element?: HTMLElement } = $props();

	const generatedInstanceId = $props.id();
	const instanceId = untrack(() => rootId) ?? generatedInstanceId;

	let rootElement = $state<HTMLElement>();
	$effect(() => {
		element = rootElement;
	});

	// Query state (controlled when `inputValue` is provided, else uncontrolled).
	let internalValue = $state(untrack(() => defaultInputValue));
	const currentValue = $derived(inputValue ?? internalValue);

	function setInputValue(value: string) {
		internalValue = value;
		if (inputValue !== undefined) inputValue = value;
		onInputChange?.(value);
	}

	let focusVisible = $state(false);
	let inputRef = $state<HTMLElement | null>(null);
	let listboxCtxRef = $state<ListBoxContext | null>(null);
	let listboxRef = $state<HTMLElement | null>(null);

	// Virtual focus / aria-activedescendant navigation, scoped to the listbox.
	const nav = useVirtualFocus({
		instanceId,
		itemPrefix: 'autocomplete-item',
		containerRef: () => listboxRef
	});

	// Auto-highlight the first match (and keep the highlight valid) as items filter.
	$effect(() => {
		if (!autoHighlight) return;
		const ids = nav.itemIds;
		// Re-run when the query changes.
		void currentValue;
		untrack(() => {
			if (ids.length === 0) {
				if (nav.focusedId !== null) nav.setFocused(null);
			} else if (nav.focusedId === null || !ids.includes(nav.focusedId)) {
				nav.first();
			}
		});
	});

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusVisible = true;
				nav.next();
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusVisible = true;
				nav.previous();
				break;
			case 'PageDown':
				event.preventDefault();
				focusVisible = true;
				nav.pageDown();
				break;
			case 'PageUp':
				event.preventDefault();
				focusVisible = true;
				nav.pageUp();
				break;
			case 'Enter': {
				const focusedId = nav.focusedId;
				if (focusedId !== null && listboxCtxRef && !listboxCtxRef.isDisabled(focusedId)) {
					event.preventDefault();
					listboxCtxRef.select(focusedId);
				}
				break;
			}
			case 'Escape':
				if (currentValue) {
					event.preventDefault();
					setInputValue('');
				}
				break;
		}
	}

	const ctx: AutocompleteContext = {
		instanceId,
		get inputValue() {
			return currentValue;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isFocusVisible() {
			return focusVisible;
		},
		get filter() {
			return filter;
		},
		get focusedItemId() {
			return nav.focusedId;
		},
		get itemIds() {
			return nav.itemIds;
		},
		get visibleCount() {
			return nav.itemIds.length;
		},
		get inputRef() {
			return inputRef;
		},
		get listboxCtx() {
			return listboxCtxRef;
		},
		get listboxRef() {
			return listboxRef;
		},
		setInputValue,
		setFocusVisible: (visible: boolean) => {
			focusVisible = visible;
		},
		setFocusedItemId: (id: string | number | null) => {
			nav.setFocused(id);
		},
		registerItem: (id: string | number, label: string) => {
			nav.register(id, label);
		},
		unregisterItem: (id: string | number) => {
			nav.unregister(id);
		},
		setInputRef: (el: HTMLElement | null) => {
			inputRef = el;
		},
		focusInput: () => {
			inputRef?.focus({ preventScroll: true });
		},
		setListboxCtx: (lbCtx: ListBoxContext) => {
			listboxCtxRef = lbCtx;
		},
		setListboxRef: (el: HTMLElement | null) => {
			listboxRef = el;
		},
		handleKeydown
	};

	setAutocompleteContext(ctx);
</script>

<div
	bind:this={rootElement}
	class={className}
	data-disabled={disabled || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
>
	{#if children}
		{@render children()}
	{/if}
</div>
