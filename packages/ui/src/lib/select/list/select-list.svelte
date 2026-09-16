<script lang="ts" generics="T extends object = object">
	import { tick, untrack } from 'svelte';
	import { ListBoxRoot as ListBox, type ListBoxContext } from '../../listbox';
	import { useSelectContext, type SelectKey } from '../root/context';
	import type { ComponentProps, Snippet } from 'svelte';

	type SelectListProps = Omit<
		ComponentProps<typeof ListBox>,
		| 'selectionMode'
		| 'selectionBehavior'
		| 'value'
		| 'defaultValue'
		| 'controlledValue'
		| 'onChange'
		| 'context'
		| 'element'
		| 'children'
		| 'items'
		| 'id'
		| 'disabledKeys'
		| 'disableFocusHandling'
		| 'loop'
		| 'typeahead'
		| 'aria-label'
		| 'aria-labelledby'
	> & {
		/**
		 * The items, for a list that the component makes from an array. Use it with a snippet that
		 * receives one item. Give the same array to the root, so the trigger knows the text of each
		 * key while the popover is closed.
		 */
		items?: Iterable<T>;
		/** The content of the list. From an array of items, it receives one item. */
		children?: Snippet<[T]> | Snippet;
	};

	/**
	 * Select.List — the listbox inside the popover.
	 *
	 * It is `ListBox.Root` with the selection of the select. The focus goes into it when the
	 * popover opens, on the selected option, thus the arrow keys, `Home`, `End` and the
	 * typeahead of the listbox operate the select. It adds `PageUp` and `PageDown`, which move
	 * the focus ten options, and it closes the popover on `Tab`.
	 */
	let {
		children,
		items,
		onkeydowncapture: onKeyDownCaptureExternal,
		onfocusin: onFocusInExternal,
		onfocusout: onFocusOutExternal,
		...props
	}: SelectListProps = $props();

	const ctx = useSelectContext('Select.List');

	let listboxCtx: ListBoxContext | undefined = $state();
	let listboxElement: HTMLElement | undefined = $state();

	const listboxSelection = $derived(Array.from(ctx.selectedKeys));
	const disabledKeys = $derived(Array.from(ctx.disabledKeys));
	// A second press on the selected option must not clear it: the field always has an answer,
	// the same as a native select. In the multiple mode a press toggles.
	const selectionBehavior = $derived(ctx.selectionMode === 'single' ? 'replace' : 'toggle');

	$effect(() => {
		const current = listboxCtx ?? null;
		ctx.setListboxCtx(current);
		return () => {
			if (ctx.listboxCtx === current) ctx.setListboxCtx(null);
		};
	});

	$effect(() => {
		const current = listboxElement ?? null;
		ctx.setListboxRef(current);
		return () => {
			if (ctx.listboxRef === current) ctx.setListboxRef(null);
		};
	});

	function handleSelectionChange(selection: Set<SelectKey>) {
		ctx.commitSelection(selection);
	}

	// The root shows one focus state for the trigger and the list together: the list is in a
	// portal, thus the root cannot read it from its own descendants.
	$effect(() => {
		if (!listboxCtx) return;
		return listboxCtx.subscribeToFocusVisible((visible) => {
			if (ctx.isFocusWithin) ctx.setFocusVisible(visible);
		});
	});

	function handleFocusIn(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		ctx.setFocusWithin(true);
		onFocusInExternal?.(event);
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		queueMicrotask(() => {
			const active = document.activeElement;
			const trigger = ctx.triggerRef;
			const inTrigger = !!trigger && (active === trigger || trigger.contains(active));
			const inList =
				!!listboxElement && (active === listboxElement || listboxElement.contains(active));
			if (!inTrigger && !inList) {
				ctx.setFocusWithin(false);
			}
		});
		onFocusOutExternal?.(event);
	}

	function getEnabledOptions(): HTMLElement[] {
		if (!listboxElement) return [];
		return Array.from(
			listboxElement.querySelectorAll<HTMLElement>('[data-navigation-item]:not([data-disabled])')
		);
	}

	function readOptionKey(option: HTMLElement | null): SelectKey | null {
		if (!option || option.getAttribute('role') !== 'option') return null;
		const raw = option.dataset.itemId;
		if (raw === undefined) return null;
		return option.dataset.itemIdType === 'number' ? Number(raw) : raw;
	}

	function focusOptionByKey(key: SelectKey) {
		listboxCtx?.keyboardNav.focusById(key);
	}

	/**
	 * Puts the focus in the list when the popover opens.
	 *
	 * The selected option, when there is one and it is enabled; otherwise the first or the
	 * last option, as the key that opened the popover asked. A character typed on the closed
	 * trigger is searched afterwards, thus the focus lands on the option that starts with it.
	 */
	async function applyOpenFocus() {
		await tick();
		if (!ctx.isOpen || !listboxCtx || !listboxElement) return;
		listboxCtx.keyboardNav.updateItems();
		const intent = ctx.consumeOpenFocus();
		const [selected] = ctx.selectedKeys;
		const enabledKeys = new Set(
			getEnabledOptions()
				.map((option) => readOptionKey(option))
				.filter((key): key is SelectKey => key !== null)
		);

		if (intent === 'last') {
			listboxCtx.keyboardNav.focusLast();
		} else if (intent === 'selected' && selected !== undefined && enabledKeys.has(selected)) {
			focusOptionByKey(selected);
		} else {
			listboxCtx.keyboardNav.focusFirst();
		}

		const char = ctx.consumePendingTypeahead();
		if (char) {
			listboxCtx.keyboardNav.typeahead(char);
		}
	}

	let wasOpen = false;
	$effect(() => {
		const open = ctx.isOpen;
		const ready = Boolean(listboxCtx && listboxElement);
		if (open && ready && !wasOpen) {
			wasOpen = true;
			untrack(() => void applyOpenFocus());
		} else if (!open) {
			wasOpen = false;
		}
	});

	// The listbox itself has the arrows, `Home`, `End`, `Enter`, `Space` and the typeahead. This
	// runs in the capture phase, before the listbox: its own handler takes `ArrowUp` for a move,
	// and it would move the focus before `Alt+ArrowUp` can close.
	function handleKeyDownCapture(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onKeyDownCaptureExternal?.(event);
		if (event.defaultPrevented) return;

		if (event.key === 'Tab') {
			// The focus goes to the trigger first, without `preventDefault`, so the browser
			// continues from there: from the portal it would land at the end of the document.
			ctx.triggerRef?.focus();
			ctx.close('focus-out', event);
			return;
		}

		if (event.key === 'PageUp' || event.key === 'PageDown') {
			event.preventDefault();
			const options = getEnabledOptions();
			if (options.length === 0) return;
			const active = document.activeElement as HTMLElement | null;
			const currentIndex = active ? options.indexOf(active) : -1;
			const step = event.key === 'PageDown' ? 10 : -10;
			const nextIndex = Math.min(options.length - 1, Math.max(0, currentIndex + step));
			const key = readOptionKey(options[nextIndex]);
			if (key !== null) focusOptionByKey(key);
			return;
		}

		// Alt+ArrowUp selects the focused option and closes the list, as in the APG pattern. With
		// nothing focused it only closes.
		if (event.key === 'ArrowUp' && event.altKey) {
			event.preventDefault();
			event.stopPropagation();
			const active = document.activeElement as HTMLElement | null;
			const key = readOptionKey(active);
			if (key !== null && listboxCtx && !listboxCtx.isDisabled(key)) {
				listboxCtx.select(key);
				if (!ctx.isOpen) return;
			}
			ctx.close('imperative-action', event);
		}
	}
</script>

<ListBox
	{...props}
	bind:context={listboxCtx}
	bind:element={listboxElement}
	id={ctx.listboxId}
	{items}
	{children}
	selectionMode={ctx.selectionMode}
	{selectionBehavior}
	{disabledKeys}
	loop={ctx.loop}
	typeahead={true}
	value={listboxSelection}
	onChange={handleSelectionChange}
	aria-labelledby={ctx.triggerId}
	data-select-list="true"
	onkeydowncapture={handleKeyDownCapture}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
/>
