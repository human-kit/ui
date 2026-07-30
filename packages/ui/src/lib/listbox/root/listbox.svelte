<script lang="ts" generics="T extends object = object">
	import type { Snippet } from 'svelte';
	import { onMount, tick, untrack } from 'svelte';
	import { createListBoxContext, type ListBoxContext } from './context';
	import { trackInteractionModality } from '../../primitives/input-modality';
	import { computeListWindow, scrollTopForIndex } from '../../primitives/list-virtualizer';

	/**
	 * Props for the ListBox component.
	 * @template T - The type of items when using dynamic rendering with the `items` prop.
	 */
	type ListBoxProps = {
		/** How selection behaves: 'toggle' allows deselection, 'replace' always selects. */
		selectionBehavior?: 'toggle' | 'replace';
		/** Content shown when the list is empty. Can be a string or a Snippet. */
		emptyPlaceholder?: string | Snippet;
		/** Iterable of items for dynamic rendering. Used with a snippet that receives each item. */
		items?: Iterable<T>;
		/** Keys of items that should be disabled and non-selectable. */
		disabledKeys?: Iterable<string | number>;
		/** Selection mode: 'single' allows one selection, 'multiple' allows many. */
		selectionMode?: 'single' | 'multiple';
		/** Selected keys. Two-way by default — use `bind:value`. */
		value?: Iterable<string | number>;
		/** Initial selection, for when `value` is not supplied. */
		defaultValue?: Iterable<string | number>;
		/**
		 * Opt into fully controlled state: the component stops writing back to `value` and
		 * only reports through `onChange`, so the parent can reject a change by not flowing
		 * the new selection back down. Off by default, because `bind:value` — the common
		 * case — needs the write-back to work at all.
		 */
		controlledValue?: boolean;
		/** Content of the listbox. Can be static children or a snippet receiving items. */
		children?: Snippet | Snippet<[T]>;
		/**
		 * Rows rendered inside the listbox above the items — an action row such as
		 * "Create …". Kept out of `children` because in dynamic mode that snippet is called
		 * once per item.
		 *
		 * A virtualized list does not navigate into it: navigation there walks the item
		 * array, which this is not part of.
		 */
		header?: Snippet;
		/** CSS class to apply to the listbox container. */
		class?: string;
		/** HTML id attribute for the listbox element. */
		id?: string;
		/** Accessible label for the listbox. Announced by screen readers. */
		'aria-label'?: string;
		/** Callback fired when the selection changes. */
		onChange?: (value: Set<string | number>) => void;
		/** Disable DOM focus handling on the root container for virtual-focus compositions. */
		disableFocusHandling?: boolean;
		/** Whether arrow-key navigation wraps from the last item to the first (and back). */
		loop?: boolean;
		/** Whether typing characters moves focus to the option whose text matches. */
		typeahead?: boolean;
		/**
		 * Renders only the rows near the viewport instead of all of them.
		 *
		 * Only honoured together with `items`: the listbox has to own the loop to be able to
		 * slice it, so a list written as static children is never virtualized.
		 *
		 * Rows must all be the same height — that assumption is what lets the scrollbar be
		 * sized without measuring every row. The height is measured from the first rendered
		 * row unless `rowHeight` says otherwise, so a themed list needs no magic number.
		 *
		 * The listbox element itself is the scroller: give it a max height and
		 * `overflow-y: auto`, as an unvirtualized long list would need anyway.
		 */
		virtualizer?: { rowHeight?: number; overscan?: number };
	};

	let {
		selectionBehavior = 'toggle',
		emptyPlaceholder = 'No items selected',
		items,
		disabledKeys,
		selectionMode = 'single',
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		children,
		header,
		class: className = '',
		id,
		'aria-label': ariaLabel,
		onChange,
		disableFocusHandling = false,
		loop = false,
		typeahead = false,
		virtualizer,
		context = $bindable(),
		element = $bindable()
	}: ListBoxProps & { context?: ListBoxContext; element?: HTMLElement } = $props();

	let listboxElement: HTMLElement;

	// Expose element via bindable prop
	$effect(() => {
		element = listboxElement;
	});

	function parseSelection(val: Iterable<string | number> | undefined): Set<string | number> {
		if (val === undefined) return new Set();
		return new Set(val);
	}

	// In controlled mode the parent owns the selection: `select` only emits `onChange`
	// and the sync effect below applies whatever the parent passes down. Controlled-ness
	// is NOT inferred from `value` being defined: `bind:value={keys}` and `value={keys}`
	// are indistinguishable at runtime, so inferring it silently broke every `bind:value`.
	// It is opt-in via `controlledValue` instead.
	const isControlled = untrack(() => controlledValue);

	const ctx = createListBoxContext({
		get selectionMode() {
			return selectionMode;
		},
		get selectionBehavior() {
			return selectionBehavior;
		},
		get disabledKeys() {
			return disabledKeys;
		},
		get loop() {
			return loop;
		},
		get typeahead() {
			return typeahead;
		},
		// Use function to capture initial value only (not reactive)
		initialSelection: (() => parseSelection(value ?? defaultValue))(),
		isControlled,
		onSelectionChange: (newSelection) => {
			if (!isControlled) {
				// Uncontrolled mode: keep `bind:value` in sync with the selection.
				value = Array.from(newSelection);
			}
			onChange?.(newSelection);
		}
	});

	// Expose context via bindable prop
	context = ctx;

	const { action: keyboardAction } = ctx.keyboardNav;

	$effect(() => {
		if (value !== undefined) {
			const newSelection = parseSelection(value);
			ctx.setSelection(newSelection);
		}
	});

	$effect(() => {
		const keys = disabledKeys ? Array.from(disabledKeys) : [];
		// `ctx.disabledKeys` is a reactive set; mutate inside `untrack` so this
		// effect only re-runs when the `disabledKeys` prop changes.
		untrack(() => {
			ctx.disabledKeys.clear();
			for (const id of keys) {
				ctx.disabledKeys.add(id);
			}
		});
	});

	let itemCount = $state(0);

	// Subscribe to item count changes for reactive empty state
	$effect(() => {
		const unsubscribe = ctx.subscribeToItemCount((count) => {
			itemCount = count;
		});
		return unsubscribe;
	});

	const itemsArray = $derived(items ? Array.from(items) : []);
	const hasDynamicItems = $derived(items !== undefined);

	// --- Virtualization -----------------------------------------------------
	// Only the rows near the viewport are rendered; the rest is two numbers — a spacer that
	// holds the scrollbar at the height of the full list, and an offset that puts the
	// rendered block where those rows would have been.
	const isVirtual = $derived(Boolean(virtualizer) && hasDynamicItems);

	let scrollTop = $state(0);
	let viewportHeight = $state(0);
	/**
	 * The distance from one row's top edge to the next one's, measured off two rendered rows.
	 *
	 * Measured rather than declared because the row's height comes from the consumer's own
	 * styles — and measured as a *distance*, not as height + `row-gap`, because that sum was
	 * wrong by about a pixel and the error is cumulative: the offset of row N is N times it,
	 * so a thousand rows down the window was placed a thousand pixels away from where the
	 * scrollbar said it was and the list rendered blank.
	 */
	let measuredPitch = $state(0);
	/** The row's own height, for deciding when a row is fully inside the viewport. */
	let measuredRowHeight = $state(0);
	/**
	 * The listbox's own `row-gap`, applied to the rendered window so the rows keep the
	 * spacing the consumer styled them with.
	 *
	 * Read from the style rather than derived from the pitch on purpose: deriving it would
	 * close a circle — the gap would come from a distance the gap itself produces — and the
	 * list would settle on whatever it measured first, gap and all.
	 */
	let measuredGap = $state(0);
	/** The scroller's own top padding, which sits between `scrollTop` and the first row. */
	let measuredPadding = $state(0);

	const rowHeight = $derived(virtualizer?.rowHeight ?? measuredRowHeight);
	const pitch = $derived(
		virtualizer?.rowHeight !== undefined ? virtualizer.rowHeight + measuredGap : measuredPitch
	);
	// What the maths needs is the distance between rows; expressing it as height + gap keeps
	// `computeListWindow`'s signature honest about what a row occupies.
	const gap = $derived(Math.max(0, pitch - rowHeight));
	/**
	 * Rows rendered on the very first pass, before anything has been measured.
	 *
	 * Without it the list would deadlock: the window needs a row height, the height comes
	 * from measuring rendered rows, and nothing is rendered until there's a window. A
	 * viewport's worth is enough to measure and to fill the first paint.
	 */
	const BOOTSTRAP_ROWS = 20;

	/**
	 * The viewport to size the window against, never taller than the screen.
	 *
	 * `clientHeight` is the height of the scroller, which is only meaningful once something
	 * constrains it. A popover applies its max height *after* it opens, so on the first pass
	 * the list is as tall as its own content — and a "viewport" of 28.000px asks for a
	 * window of every row there is. That is how opening a 1122-row list mounted 1122 rows
	 * (~7s) before shrinking back to 19: virtualized in the end, but only after paying for
	 * the whole list.
	 *
	 * A list can legitimately be as tall as the screen, never taller, so the screen is the
	 * cap. The ResizeObserver corrects the number the moment the real constraint lands.
	 */
	const effectiveViewportHeight = $derived(
		typeof window === 'undefined' ? viewportHeight : Math.min(viewportHeight, window.innerHeight)
	);

	const listWindow = $derived(
		isVirtual && rowHeight > 0 && pitch > 0
			? computeListWindow({
					count: itemsArray.length,
					itemHeight: rowHeight,
					gap,
					viewportHeight: effectiveViewportHeight,
					scrollTop,
					overscan: virtualizer?.overscan ?? 8,
					padding: measuredPadding
				})
			: undefined
	);
	const visibleItems = $derived.by(() => {
		if (listWindow) {
			return itemsArray.slice(listWindow.from, listWindow.to + 1);
		}

		return isVirtual ? itemsArray.slice(0, BOOTSTRAP_ROWS) : itemsArray;
	});

	/** Below this a re-measurement is noise, not a correction worth re-rendering for. */
	const MEASUREMENT_EPSILON = 0.5;

	/**
	 * Reads the row geometry off what is actually on screen.
	 *
	 * Only ever *writes* the measurements — reading them here would close a loop with the
	 * window that renders the rows it measures (an effect that reads and writes the same
	 * state re-runs until Svelte gives up).
	 */
	function measureRows() {
		if (!listboxElement || !isVirtual) return;

		const rows = listboxElement.querySelectorAll<HTMLElement>('[data-listbox-window] > *');
		const first = rows[0]?.getBoundingClientRect();
		if (!first || first.height <= 0) return;

		// Two rows give the pitch exactly, gap included. With only one, fall back to its
		// height plus the declared gap — the same guess as before, but now it is the
		// exception rather than the rule.
		const second = rows[1]?.getBoundingClientRect();
		const style = getComputedStyle(listboxElement);
		const declaredGap = Number.parseFloat(style.rowGap);
		const declaredPadding = Number.parseFloat(style.paddingTop);
		const nextPitch = second
			? second.top - first.top
			: first.height + (Number.isFinite(declaredGap) ? declaredGap : 0);

		const nextGap = Number.isFinite(declaredGap) ? declaredGap : 0;
		const nextPadding = Number.isFinite(declaredPadding) ? declaredPadding : 0;

		untrack(() => {
			if (Math.abs(first.height - measuredRowHeight) > MEASUREMENT_EPSILON) {
				measuredRowHeight = first.height;
			}
			if (nextPitch > 0 && Math.abs(nextPitch - measuredPitch) > MEASUREMENT_EPSILON) {
				measuredPitch = nextPitch;
			}
			if (Math.abs(nextGap - measuredGap) > MEASUREMENT_EPSILON) {
				measuredGap = nextGap;
			}
			if (Math.abs(nextPadding - measuredPadding) > MEASUREMENT_EPSILON) {
				measuredPadding = nextPadding;
			}
		});
	}

	$effect(() => {
		if (!isVirtual || !listboxElement) return;

		// Re-measure whenever the rendered set changes — a list that was filtered, a window
		// that moved — so a first measurement taken mid-animation gets corrected instead of
		// misplacing every row after it. Reads nothing it writes.
		void itemsArray.length;
		void listWindow?.from;

		const element = listboxElement;

		measureRows();

		const observer = new ResizeObserver(() => {
			untrack(() => {
				if (element.clientHeight !== viewportHeight) {
					viewportHeight = element.clientHeight;
				}
			});
			measureRows();
		});

		observer.observe(element);
		viewportHeight = element.clientHeight;

		return () => observer.disconnect();
	});

	function handleScroll() {
		if (isVirtual && listboxElement) {
			scrollTop = listboxElement.scrollTop;
		}
	}

	/**
	 * Brings a row into view by index, mounting it if the window didn't reach it.
	 *
	 * This is what makes keyboard navigation work over rows that aren't rendered: the caller
	 * moves its focus by index over the whole list and asks for the row, and by the time the
	 * promise resolves the element exists and can be pointed at with `aria-activedescendant`.
	 */
	async function scrollIndexIntoView(
		index: number,
		options?: { align?: 'nearest' | 'center' }
	): Promise<boolean> {
		// Nothing to compute before the first measurement: a zero row height or an unmeasured
		// viewport would send the list to an offset with no rows in it, which is what a blank
		// list is.
		if (!isVirtual || !listboxElement || rowHeight <= 0 || effectiveViewportHeight <= 0) {
			return false;
		}

		const next = scrollTopForIndex({
			index,
			count: itemsArray.length,
			itemHeight: rowHeight,
			gap,
			viewportHeight: effectiveViewportHeight,
			scrollTop,
			padding: measuredPadding,
			align: options?.align
		});

		if (next === null) {
			// Already where it should be.
			await tick();
			return true;
		}

		listboxElement.scrollTop = next;
		// Read it back instead of trusting the assignment: the browser clamps to the real
		// scroll range, and a state that disagrees with the element renders a window the
		// viewport isn't looking at.
		scrollTop = listboxElement.scrollTop;

		// The window is derived from `scrollTop`, so the row exists only after the update.
		await tick();

		// Whether it actually landed. A scroll asked for before the list has its final
		// height gets clamped to a range that doesn't exist yet, and the caller needs to
		// know so it can ask again rather than assume the row is where it wanted it.
		return Math.abs(scrollTop - next) < 1;
	}

	// Published on the context so a composite widget (a ComboBox, whose keyboard focus lives
	// on its input) can reach a row the window hasn't rendered yet.
	ctx.setScrollIndexIntoView(scrollIndexIntoView);
	ctx.setVirtualized(() => isVirtual);
	let hasMounted = $state(false);
	const registeredItemCount = $derived(hasMounted ? itemCount : ctx.getItemCount());
	const shouldShowEmptyPlaceholder = $derived(
		hasDynamicItems ? itemsArray.length === 0 : !children || registeredItemCount === 0
	);

	let focusWithin = $state(false);

	onMount(() => {
		hasMounted = true;
	});

	function syncFocusWithin() {
		focusWithin =
			!!listboxElement &&
			!!document.activeElement &&
			listboxElement.contains(document.activeElement);
	}

	function handleFocusIn() {
		focusWithin = true;
	}

	function handleFocusOut() {
		queueMicrotask(syncFocusWithin);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		ctx.setFocusVisible(false);
		if (disableFocusHandling) {
			event.preventDefault();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		if (focusWithin) {
			ctx.setFocusVisible(true);
		}
	}
</script>

<div
	bind:this={listboxElement}
	role="listbox"
	{id}
	aria-multiselectable={selectionMode === 'multiple'}
	aria-label={ariaLabel}
	class={className}
	tabindex={disableFocusHandling ? undefined : focusWithin ? -1 : 0}
	data-focus-within={focusWithin || undefined}
	use:keyboardAction
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	onscroll={handleScroll}
>
	{#if header}
		{@render header()}
	{/if}

	{#if items && children && isVirtual}
		<!-- The spacer carries the height of the whole list so the scrollbar matches it; the
			window is placed at the offset the first rendered row would have had. It repeats the
			listbox's own gap so rows sit exactly where the maths says they do. -->
		<!-- `flex: 0 0 auto` because the listbox is usually a flex column: without it the
			spacer is shrunk to the viewport height and there is nothing left to scroll. -->
		<div
			data-listbox-spacer
			style="position: relative; flex: 0 0 auto; height: {listWindow?.contentHeight ?? 0}px"
		>
			<div
				data-listbox-window
				style="position: absolute; top: {listWindow?.offset ??
					0}px; left: 0; right: 0; display: flex; flex-direction: column; gap: {measuredGap}px"
			>
				{#each visibleItems as item (item)}
					{@render (children as Snippet<[T]>)(item)}
				{/each}
			</div>
		</div>
	{:else if items && children}
		{#each itemsArray as item (item)}
			{@render (children as Snippet<[T]>)(item)}
		{/each}
	{:else if children}
		{@render (children as Snippet)()}
	{/if}

	{#if shouldShowEmptyPlaceholder}
		{#if typeof emptyPlaceholder === 'string'}
			<div role="option" aria-selected="false" aria-disabled="true" data-empty-placeholder>
				{emptyPlaceholder}
			</div>
		{:else if emptyPlaceholder}
			{@render emptyPlaceholder()}
		{/if}
	{/if}
</div>
