<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { getRatingValueFromPointer, snapRatingValue } from '../root/rating-utils';
	import { useRatingContext } from '../root/context';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import type { RatingItemProps, RatingItemRenderState } from '../types';

	/**
	 * Rating.Item — one item of the scale, for example one star.
	 *
	 * In a radio group the item is a radio, and it is the tab stop of its value. In a slider, at
	 * a precision below 1, the item is decoration: the root holds the role and the focus. The
	 * item shows how full it is in `--rating-item-fill`, from 0 to 1, thus a half star needs no
	 * second element.
	 */
	let {
		index: indexProp,
		'aria-label': ariaLabel,
		children,
		class: className = '',
		element = $bindable<HTMLSpanElement | null>(null),
		style,
		onpointerdown,
		onpointerenter,
		onpointermove,
		onkeydown,
		onfocus,
		onblur,
		...restProps
	}: RatingItemProps = $props();

	const ctx = useRatingContext('Rating.Item');

	let itemRef: HTMLSpanElement | null = $state(null);

	const registration = ctx.registerItem({
		index: untrack(() => indexProp),
		elementRef: () => itemRef
	});
	const index = registration.index;
	const value = $derived(index + 1);

	$effect(() => {
		element = itemRef;
		return () => {
			element = null;
		};
	});

	$effect(() => registration.unregister);

	const fill = $derived(ctx.getItemFill(value));
	const selected = $derived(ctx.value === value);
	const highlighted = $derived(fill > 0);
	const focused = $derived(ctx.focusedIndex === index);
	const focusVisible = $derived(focused && ctx.isFocusVisible);
	const tabIndex = $derived(ctx.getItemTabIndex(value));

	const renderState: RatingItemRenderState = $derived({
		value,
		index,
		fill,
		selected,
		highlighted,
		focused
	});

	/** The value the pointer is on: the whole item, or the part of it under the pointer. */
	function previewValue(event: PointerEvent): number {
		if (ctx.precision === 1 || !itemRef) return value;
		const inside = getRatingValueFromPointer(event.clientX, itemRef.getBoundingClientRect(), {
			count: 1,
			precision: ctx.precision,
			rtl: ctx.isRtl
		});
		return snapRatingValue(value - 1 + inside, ctx.count, ctx.precision);
	}

	function handlePointerDown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		ctx.pressItem(value, event);
	}

	function handlePointerEnter(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointerenter?.(event);
		// A finger has no preview: it is on the item only while it presses it, and the leave that
		// ends a preview does not come from each browser.
		if (event.pointerType === 'touch') return;
		ctx.setHoverValue(previewValue(event));
	}

	function handlePointerMove(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointermove?.(event);
		// A move inside one item changes the preview only at a precision below 1, where the two
		// halves of the item are two values.
		if (event.pointerType === 'touch' || ctx.precision === 1) return;
		ctx.setHoverValue(previewValue(event));
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || event.key !== ' ') return;
		// The arrows move the value and carry the focus with them, thus Space has work to do only
		// when the focus sits on an item that is not the value: an empty rating.
		event.preventDefault();
		event.stopPropagation();
		if (ctx.setValue(value, { reason: 'keyboard', event })) {
			ctx.commitValue({ reason: 'keyboard', event });
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onfocus?.(event);
		trackInteractionModality(event, itemRef);
		ctx.setItemFocus(index, true);
		ctx.setFocusVisible(shouldShowFocusVisible(itemRef));
	}

	// The focus ring must appear when a pointer press is followed by a key press, and the
	// modality alone changes there: no focus event fires to re-read it.
	watchFocusVisible({
		isFocused: () => focused,
		element: () => itemRef,
		set: (visible) => ctx.setFocusVisible(visible)
	});

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		onblur?.(event);
		ctx.setItemFocus(index, false);
	}

	const inlineStyle = $derived(
		`--rating-item-fill: ${fill}; --rating-item-value: ${value};` +
			` touch-action: none;${style ? ` ${style}` : ''}`
	);
</script>

<!-- The item is a radio in a radio group, and the checker cannot read a role that the context
decides. In a slider the context gives no tabindex at all. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
	{...restProps}
	bind:this={itemRef}
	id={ctx.getItemId(index)}
	role={ctx.isRadioGroup ? 'radio' : 'presentation'}
	tabindex={tabIndex ?? undefined}
	aria-checked={ctx.isRadioGroup ? selected : undefined}
	aria-label={ctx.isRadioGroup ? (ariaLabel ?? ctx.getItemLabel(value)) : undefined}
	aria-disabled={ctx.isRadioGroup && ctx.isDisabled ? true : undefined}
	class={className}
	style={inlineStyle}
	data-rating-item="true"
	data-index={index}
	data-value={value}
	data-selected={selected || undefined}
	data-highlighted={highlighted || undefined}
	data-partial={(fill > 0 && fill < 1) || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onpointerdown={handlePointerDown}
	onpointerenter={handlePointerEnter}
	onpointermove={handlePointerMove}
	onkeydown={handleKeyDown}
	onfocus={handleFocus}
	onblur={handleBlur}
>
	{#if children}
		{@render (children as Snippet<[RatingItemRenderState]>)(renderState)}
	{/if}
</span>
