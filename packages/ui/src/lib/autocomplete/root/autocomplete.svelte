<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
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

	// Visible items (including disabled-but-visible ones). Kept separately from
	// the navigation registration, which only tracks enabled items, so Empty and
	// Status reflect what is actually rendered on screen.
	const visibleItemIds = new SvelteSet<string | number>();

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
		// Ignore keystrokes that are part of an IME composition (e.g. CJK input)
		// so Enter/arrows don't select items or navigate mid-composition.
		if (event.isComposing || event.keyCode === 229) return;
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
				if (readonly) break;
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
					// Escape is consumed to clear the query: stop propagation so an
					// enclosing Dialog doesn't also close (mirrors ComboBox).
					event.stopPropagation();
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
			return visibleItemIds.size;
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
		registerVisibleItem: (id: string | number) => {
			visibleItemIds.add(id);
		},
		unregisterVisibleItem: (id: string | number) => {
			visibleItemIds.delete(id);
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

	// Clear the virtual focus when DOM focus leaves the autocomplete entirely,
	// so no option keeps a stale focus ring and the input drops its stale
	// aria-activedescendant. The check is deferred to a microtask because
	// focusout fires before the next element receives focus. Clicking an option
	// never reaches this path: the option's mousedown is prevented, so the input
	// keeps DOM focus and no focusout is emitted.
	function handleFocusOut() {
		queueMicrotask(() => {
			const active = document.activeElement;
			const stillInside =
				(!!active && (rootElement?.contains(active) ?? false)) ||
				(!!active && (listboxRef?.contains(active) ?? false));
			if (!stillInside) {
				if (nav.focusedId !== null) nav.setFocused(null);
				focusVisible = false;
			}
		});
	}
</script>

<div
	bind:this={rootElement}
	role={ariaLabel || ariaLabelledby ? 'group' : undefined}
	class={className}
	data-disabled={disabled || undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	onfocusout={handleFocusOut}
>
	{#if children}
		{@render children()}
	{/if}
</div>
