<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { readable } from 'svelte/store';
	import { dev } from '../../internal/environment';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { isRtl } from '../../internal/rtl';
	import { getLocaleContext } from '../../locale-provider/context';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import {
		focusWithModality,
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import type { RatingRootProps } from '../types';
	import { setRatingContext, type RatingChangeDetails, type RatingContext } from './context';
	import {
		getRatingItemFill,
		getRatingValueFromPointer,
		normalizeRatingCount,
		normalizeRatingPrecision,
		snapRatingValue
	} from './rating-utils';

	/**
	 * Rating.Root — the scale, the value and the keyboard.
	 *
	 * With a precision of 1 the root is a radio group, and each item is a radio: each value is
	 * one item, and that is what a screen reader reads best. With a smaller precision the root is
	 * a slider, because a radio group cannot say 3.5. The root is the one tab stop then, and the
	 * items are decoration.
	 */
	const generatedId = $props.id();

	let {
		id: idProp,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onChangeEnd,
		count = 5,
		precision = 1,
		allowClear = true,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		name,
		form,
		getItemLabel,
		getValueText,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		onkeydown,
		onkeyup,
		onpointerleave,
		style,
		...restProps
	}: RatingRootProps = $props();

	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	const instanceId = untrack(() => idProp) ?? generatedId;
	const rootId = `rating-${instanceId}`;

	let rootRef: HTMLDivElement | null = $state(null);
	let labelId: string | null = $state(null);
	let hoverValue: number | null = $state(null);
	let focusedIndex: number | null = $state(null);
	let focusVisible = $state(false);
	let rtl = $derived(isRtl(rootRef));

	type ItemRegistration = { elementRef: () => HTMLElement | null };
	const items = new SvelteMap<number, ItemRegistration>();

	const resolvedCount = $derived(normalizeRatingCount(count));
	const resolvedPrecision = $derived(normalizeRatingPrecision(precision));
	const isRadioGroup = $derived(resolvedPrecision === 1);
	const resolvedLocale = $derived($localeStore);

	$effect(() => {
		element = rootRef;
	});

	// Read one time: the component writes the value back, thus a check that follows the value
	// would report the echo of its own write.
	if (dev && untrack(() => value !== undefined && defaultValue !== undefined)) {
		console.warn(
			'[Rating]: Both "value" and "defaultValue" are provided. ' +
				'Use "value" for controlled mode or "defaultValue" for uncontrolled mode, not both.'
		);
	}

	// --- Value --------------------------------------------------------------------------------

	const initialValue = untrack(() => value) ?? untrack(() => defaultValue) ?? 0;
	let valueInternal = $state(initialValue);

	// Controlled-ness is opt-in, not inferred: `bind:value` and `value={...}` are the same thing
	// at runtime. The prop wins whenever the consumer supplies it.
	const currentValue = $derived(
		controlledValue || value !== undefined ? (value ?? valueInternal) : valueInternal
	);
	const displayValue = $derived(hoverValue ?? currentValue);

	// A `bind:value` that starts undefined gets the value at mount, thus the parent reads the
	// default without a first change.
	$effect(() => {
		if (controlledValue) return;
		untrack(() => {
			if (value === undefined) value = valueInternal;
		});
	});

	function setValue(nextRaw: number, details: RatingChangeDetails): boolean {
		if (disabled || readonly) return false;
		const next = snapRatingValue(nextRaw, resolvedCount, resolvedPrecision);
		if (next === currentValue) return false;
		if (!controlledValue) {
			valueInternal = next;
			value = next;
		}
		onChange?.(next, details);
		return true;
	}

	function commitValue(details: RatingChangeDetails) {
		onChangeEnd?.(currentValue, details);
	}

	function stepValue(direction: -1 | 1, event?: Event): boolean {
		const lowest = allowClear ? 0 : resolvedPrecision;
		const next = currentValue + direction * resolvedPrecision;
		if (next < lowest) return false;
		return setValue(next, { reason: 'keyboard', event });
	}

	// --- Text ---------------------------------------------------------------------------------

	function defaultValueText(val: number): string {
		if (val === 0) return resolveLocalizedString(resolvedLocale, 'rating.empty');
		return resolveLocalizedString(resolvedLocale, 'rating.valueText', {
			value: val,
			count: resolvedCount
		});
	}

	function valueTextOf(val: number): string {
		return getValueText ? getValueText(val, resolvedCount) : defaultValueText(val);
	}

	function itemLabelOf(val: number): string {
		if (getItemLabel) return getItemLabel(val, resolvedCount);
		return resolveLocalizedString(resolvedLocale, 'rating.valueText', {
			value: val,
			count: resolvedCount
		});
	}

	// --- Pointer ------------------------------------------------------------------------------

	/** The value of a press inside one item: the whole item, or the part the pointer is on. */
	function valueFromPointer(itemValue: number, event: PointerEvent, target: HTMLElement): number {
		if (isRadioGroup) return itemValue;
		const rect = target.getBoundingClientRect();
		const inside = getRatingValueFromPointer(event.clientX, rect, {
			count: 1,
			precision: resolvedPrecision,
			rtl
		});
		return snapRatingValue(itemValue - 1 + inside, resolvedCount, resolvedPrecision);
	}

	function pressItem(itemValue: number, event: PointerEvent) {
		if (disabled || readonly || event.button !== 0) return;
		const target = event.currentTarget;
		if (!(target instanceof HTMLElement)) return;

		// The press must not select the text beside the items, and the focus below must carry the
		// pointer modality: a press shows no focus ring.
		event.preventDefault();
		trackInteractionModality(event, target);
		rtl = isRtl(rootRef);

		const next = valueFromPointer(itemValue, event, target);
		const cleared = allowClear && next === currentValue;
		const reason = cleared ? 'clear' : 'pointer';
		const changed = setValue(cleared ? 0 : next, { reason, event });
		// The preview follows a pointer that can rest on the items. A finger cannot, and the leave
		// that would end the preview does not come from each browser.
		hoverValue = event.pointerType === 'touch' ? null : cleared ? 0 : next;
		focusValue(cleared ? 0 : next, 'pointer');
		if (changed) commitValue({ reason, event });
	}

	function setHoverValue(next: number | null) {
		if (disabled || readonly) return;
		hoverValue = next;
	}

	function handlePointerLeave(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerleave?.(event);
		hoverValue = null;
	}

	$effect(() => {
		if (!disabled && !readonly) return;
		hoverValue = null;
		if (disabled) {
			focusedIndex = null;
			focusVisible = false;
		}
	});

	// --- Focus --------------------------------------------------------------------------------

	/** The item the tab order lands on: the value, or the first item when there is no value. */
	const tabIndexValue = $derived(
		currentValue >= 1 ? Math.min(Math.ceil(currentValue), resolvedCount) : 1
	);

	function getItemTabIndex(itemValue: number): number | null {
		if (!isRadioGroup || disabled) return null;
		return itemValue === tabIndexValue ? 0 : -1;
	}

	function focusValue(val: number, modality: 'keyboard' | 'pointer' = 'keyboard') {
		if (disabled) return;
		// A slider has one tab stop, and it is the root. Without this the arrows after a press
		// went to the body, and the rating did not answer them until the reader pressed Tab.
		if (!isRadioGroup) {
			if (!rootRef || document.activeElement === rootRef) return;
			focusWithModality(rootRef, modality);
			return;
		}
		const index = Math.min(Math.max(Math.ceil(val), 1), resolvedCount) - 1;
		const node = items.get(index)?.elementRef();
		if (!node || document.activeElement === node) return;
		focusWithModality(node, modality);
	}

	// The focus ring must appear when a pointer press is followed by a key press, and the
	// modality alone changes there: no focus event fires to re-read it. In a radio group the
	// focus is on an item, and the item watches its own.
	watchFocusVisible({
		isFocused: () => !isRadioGroup && focusedIndex !== null,
		element: () => rootRef,
		set: (visible) => {
			focusVisible = visible;
		}
	});

	// --- Keyboard -----------------------------------------------------------------------------

	// The keyboard reports `onChange` on each key press, and `onChangeEnd` one time at the
	// release, thus a held key does not report an end on each repeat.
	let keyboardChanged = false;

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || disabled || readonly) return;
		if (event.ctrlKey || event.metaKey || event.altKey) return;

		const forward = isRtl(rootRef) ? 'ArrowLeft' : 'ArrowRight';
		const backward = isRtl(rootRef) ? 'ArrowRight' : 'ArrowLeft';
		let changed = false;

		switch (event.key) {
			case forward:
			case 'ArrowUp':
				changed = stepValue(1, event);
				break;
			case backward:
			case 'ArrowDown':
				changed = stepValue(-1, event);
				break;
			case 'Home':
				changed = setValue(resolvedPrecision, { reason: 'keyboard', event });
				break;
			case 'End':
				changed = setValue(resolvedCount, { reason: 'keyboard', event });
				break;
			case 'Delete':
			case 'Backspace':
				if (!allowClear) return;
				changed = setValue(0, { reason: 'clear', event });
				break;
			default:
				return;
		}

		event.preventDefault();
		if (changed) keyboardChanged = true;
		// In a radio group the focus follows the value, which is the rule of a radio group: the
		// arrows do not only move, they answer the question.
		focusValue(currentValue);
	}

	function handleKeyUp(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeyup?.(event);
		if (!keyboardChanged) return;
		keyboardChanged = false;
		commitValue({ reason: 'keyboard', event });
	}

	// --- Form reset ---------------------------------------------------------------------------

	let hiddenInputRef: HTMLInputElement | null = $state(null);

	$effect(() => {
		const formElement = hiddenInputRef?.form;
		if (!formElement) return;

		const handleFormReset = () => {
			// The browser resets the native inputs after the `reset` event; re-sync afterwards.
			queueMicrotask(() => {
				if (currentValue === initialValue) return;
				if (!controlledValue) {
					valueInternal = initialValue;
					value = initialValue;
				}
				onChange?.(initialValue, { reason: 'form-reset' });
			});
		};

		formElement.addEventListener('reset', handleFormReset);
		return () => formElement.removeEventListener('reset', handleFormReset);
	});

	// --- Context ------------------------------------------------------------------------------

	const ratingContext: RatingContext = {
		instanceId,
		rootId,
		get labelId() {
			return labelId;
		},
		get value() {
			return currentValue;
		},
		get displayValue() {
			return displayValue;
		},
		get count() {
			return resolvedCount;
		},
		get precision() {
			return resolvedPrecision;
		},
		get allowClear() {
			return allowClear;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isRequired() {
			return required;
		},
		get isInvalid() {
			return invalid;
		},
		get isHovering() {
			return hoverValue !== null;
		},
		get isFocusVisible() {
			return focusVisible;
		},
		get isRtl() {
			return rtl;
		},
		get isRadioGroup() {
			return isRadioGroup;
		},
		get ariaLabel() {
			return ariaLabel;
		},
		get ariaLabelledBy() {
			return ariaLabelledBy;
		},
		get ariaDescribedBy() {
			return ariaDescribedBy;
		},
		get focusedIndex() {
			return focusedIndex;
		},
		registerLabel(id) {
			labelId = id;
			return () => {
				if (labelId === id) labelId = null;
			};
		},
		registerItem(options) {
			let index = options.index;
			if (index === undefined) {
				index = 0;
				while (items.has(index)) index += 1;
			}
			items.set(index, { elementRef: options.elementRef });
			const registeredIndex = index;
			return {
				index: registeredIndex,
				unregister: () => {
					if (items.get(registeredIndex)?.elementRef === options.elementRef) {
						items.delete(registeredIndex);
					}
				}
			};
		},
		getItemId(index) {
			return `${rootId}-item-${index}`;
		},
		getItemFill(itemValue) {
			return getRatingItemFill(itemValue, displayValue);
		},
		getItemLabel: itemLabelOf,
		getValueText: valueTextOf,
		getItemTabIndex,
		setValue,
		stepValue,
		commitValue,
		pressItem,
		setHoverValue,
		focusValue: (val) => focusValue(val),
		setItemFocus(index, focused) {
			if (focused) {
				focusedIndex = index;
			} else if (focusedIndex === index) {
				focusedIndex = null;
				focusVisible = false;
			}
		},
		setFocusVisible(visible) {
			focusVisible = visible;
		}
	};

	setRatingContext(ratingContext);
	context = ratingContext;

	const defaultLabel = $derived(resolveLocalizedString(resolvedLocale, 'rating.label'));
	const labelledBy = $derived(ariaLabelledBy ?? labelId ?? undefined);
	const sliderTabIndex = $derived(isRadioGroup || disabled ? undefined : 0);
	const inlineStyle = $derived(
		`--rating-value: ${currentValue}; --rating-display-value: ${displayValue};` +
			` --rating-count: ${resolvedCount};${style ? ` ${style}` : ''}`
	);

	function handleRootFocus(event: FocusEvent) {
		if (isRadioGroup || disabled) return;
		trackInteractionModality(event, rootRef);
		focusedIndex = 0;
		focusVisible = shouldShowFocusVisible(rootRef);
	}

	function handleRootBlur() {
		if (isRadioGroup) return;
		focusedIndex = null;
		focusVisible = false;
	}
</script>

<!-- The role is a radio group, or a slider at a precision below 1. The slider is the one tab
stop of the rating, and the checker cannot read a role that the props decide. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role={isRadioGroup ? 'radiogroup' : 'slider'}
	tabindex={sliderTabIndex}
	aria-labelledby={labelledBy}
	aria-label={labelledBy ? undefined : (ariaLabel ?? defaultLabel)}
	aria-describedby={ariaDescribedBy}
	aria-required={required || undefined}
	aria-invalid={invalid || undefined}
	aria-disabled={disabled || undefined}
	aria-readonly={readonly || undefined}
	aria-valuemin={isRadioGroup ? undefined : 0}
	aria-valuemax={isRadioGroup ? undefined : resolvedCount}
	aria-valuenow={isRadioGroup ? undefined : currentValue}
	aria-valuetext={isRadioGroup ? undefined : valueTextOf(currentValue)}
	aria-orientation={isRadioGroup ? undefined : 'horizontal'}
	class={className}
	style={inlineStyle}
	data-rating-root="true"
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-required={required || undefined}
	data-invalid={invalid || undefined}
	data-hovering={hoverValue !== null || undefined}
	data-focus-within={focusedIndex !== null || undefined}
	data-focus-visible={(focusedIndex !== null && focusVisible) || undefined}
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	onpointerleave={handlePointerLeave}
	onfocus={handleRootFocus}
	onblur={handleRootBlur}
>
	{#if name}
		<input
			bind:this={hiddenInputRef}
			type="hidden"
			{name}
			{form}
			value={currentValue}
			data-rating-input="true"
		/>
	{/if}
	{@render children?.()}
</div>
