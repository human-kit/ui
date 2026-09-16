<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { ButtonRoot } from '../../button/index.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import { useSelectContext } from '../root/context';
	import type { SelectTriggerProps, SelectTriggerRenderState } from '../types';

	/**
	 * Select.Trigger — the button that opens the list and shows the value.
	 *
	 * It carries `role="combobox"` with `aria-haspopup="listbox"`, the same as a native select
	 * in the accessibility tree, and the same as Base UI. Its name comes from `Select.Label`
	 * and from `Select.Value` together, thus a screen reader announces the field and the
	 * selection in one go.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onclick: onClickExternal,
		onkeydown: onKeyDownExternal,
		onfocus: onFocusExternal,
		onblur: onBlurExternal,
		...restProps
	}: SelectTriggerProps = $props();

	const ctx = useSelectContext('Select.Trigger');

	let buttonRef: HTMLButtonElement | null = $state(null);
	let focused = $state(false);

	// The ring must come back when a key press follows a pointer press, and only the modality
	// changes there: no focus event fires to re-read it.
	watchFocusVisible({
		isFocused: () => focused,
		element: () => buttonRef,
		set: (visible) => ctx.setFocusVisible(visible)
	});

	const hasSelection = $derived(ctx.selectedKeys.size > 0);
	const renderState = $derived<SelectTriggerRenderState>({
		open: ctx.isOpen,
		placeholder: !hasSelection,
		disabled: ctx.isDisabled
	});

	// The name is the label and the value, in that order: "Fruit, Apple". A caller's
	// `aria-labelledby` replaces the label. A caller's `aria-label` sits on this element, and the
	// list names the trigger itself, so the algorithm reads that text for it. Without any
	// label, the content of the button is the name, and `Select.Value` is in it.
	const labelSource = $derived(
		ctx.ariaLabelledBy ?? ctx.labelId ?? (ctx.ariaLabel ? ctx.triggerId : null)
	);
	const ariaLabelledBy = $derived(
		labelSource ? `${labelSource} ${ctx.valueId ?? ctx.triggerId}` : undefined
	);

	$effect(() => {
		const node = buttonRef;
		element = node;
		if (node) {
			untrack(() => ctx.setTriggerRef(node));
		}
		return () => {
			untrack(() => {
				if (node && ctx.triggerRef === node) {
					ctx.setTriggerRef(null);
				}
			});
		};
	});

	function isPrintableKey(event: KeyboardEvent) {
		return (
			event.key.length === 1 &&
			event.key !== ' ' &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.altKey
		);
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		onClickExternal?.(event);
		if (event.defaultPrevented) return;
		if (ctx.isDisabled || ctx.isReadOnly) return;
		ctx.toggle('trigger-press', event);
	}

	function handleKeyDown(
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		onKeyDownExternal?.(event);
		if (event.defaultPrevented) return;
		if (ctx.isDisabled) return;
		if (event.isComposing || event.keyCode === 229) return;
		trackInteractionModality(event, buttonRef);
		if (ctx.isReadOnly || ctx.isOpen) return;

		// The APG select-only combobox: every one of these opens the list, and the focus goes
		// to the selection, or to the first or the last option when there is none. Enter and
		// Space are handled here, and not through the click of the button, so the list is
		// open before the key comes up and the option under the focus does not take it.
		switch (event.key) {
			case 'ArrowDown':
			case 'Enter':
			case ' ':
				event.preventDefault();
				ctx.open('trigger-press', event, 'selected');
				return;
			case 'ArrowUp':
				event.preventDefault();
				ctx.open('trigger-press', event, hasSelection ? 'selected' : 'last');
				return;
			case 'Home':
				event.preventDefault();
				ctx.open('trigger-press', event, 'first');
				return;
			case 'End':
				event.preventDefault();
				ctx.open('trigger-press', event, 'last');
				return;
		}

		if (isPrintableKey(event)) {
			event.preventDefault();
			ctx.openWithTypeahead(event.key, event);
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		focused = true;
		ctx.setFocusWithin(true);
		ctx.setFocusVisible(shouldShowFocusVisible(buttonRef));
		onFocusExternal?.(event);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		focused = false;
		// The list takes the focus while the popover is open, and that is still inside the
		// select. The check waits for the new focus to land.
		queueMicrotask(() => {
			const active = document.activeElement;
			const inTrigger = !!buttonRef && (active === buttonRef || buttonRef.contains(active));
			const inList =
				!!ctx.listboxRef && (active === ctx.listboxRef || ctx.listboxRef.contains(active));
			if (!inTrigger && !inList) {
				ctx.setFocusWithin(false);
			}
		});
		onBlurExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	id={ctx.triggerId}
	class={className}
	type="button"
	role="combobox"
	disabled={ctx.isDisabled}
	pressed={ctx.isOpen || undefined}
	aria-haspopup="listbox"
	aria-expanded={ctx.isOpen}
	aria-controls={ctx.isOpen ? ctx.listboxId : undefined}
	aria-label={ctx.ariaLabel}
	aria-labelledby={ariaLabelledBy}
	aria-describedby={ctx.ariaDescribedBy}
	aria-required={ctx.isRequired || undefined}
	aria-readonly={ctx.isReadOnly || undefined}
	aria-invalid={ctx.isInvalid || undefined}
	data-select-trigger="true"
	data-state={ctx.isOpen ? 'open' : 'closed'}
	data-placeholder={hasSelection ? undefined : 'true'}
	data-readonly={ctx.isReadOnly || undefined}
	data-required={ctx.isRequired || undefined}
	data-invalid={ctx.isInvalid || undefined}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	onfocus={handleFocus}
	onblur={handleBlur}
>
	{#if children}
		{@render (children as Snippet<[SelectTriggerRenderState]>)(renderState)}
	{/if}
</ButtonRoot>
