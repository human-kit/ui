<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { readable } from 'svelte/store';
	import { dev } from '../../internal/environment';
	import { isRtl } from '../../internal/rtl';
	import { getLocaleContext } from '../../locale-provider/context';
	import { focusWithModality } from '../../primitives/input-modality';
	import type { SliderRootProps, SliderValue } from '../types';
	import { setSliderContext, type SliderChangeDetails, type SliderContext } from './context';
	import {
		clampSliderValue,
		getDefaultLargeStep,
		getNearestThumbIndex,
		getSliderPercent,
		getSliderValueFromPointer,
		getThumbBounds,
		normalizeSliderStep,
		snapSliderValue
	} from './slider-utils';

	const generatedId = $props.id();

	let {
		id: idProp,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onChangeEnd,
		min = 0,
		max = 100,
		step = 1,
		largeStep,
		minStepsBetweenThumbs = 0,
		orientation = 'horizontal',
		disabled = false,
		readonly = false,
		invalid = false,
		name,
		form,
		formatOptions,
		getValueText,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		...restProps
	}: SliderRootProps = $props();

	const localeContext = getLocaleContext();
	const localeStore = localeContext?.locale ?? readable<string | undefined>(undefined);

	const instanceId = untrack(() => idProp) ?? generatedId;
	const rootId = `slider-${instanceId}`;

	let rootRef: HTMLDivElement | null = $state(null);
	let trackRef: HTMLElement | null = $state(null);
	let labelId: string | null = $state(null);
	let draggingIndex: number | null = $state(null);
	let focusedIndex: number | null = $state(null);
	let focusVisible = $state(false);
	// Read at mount, and again at each pointer press: the direction can change after the mount.
	let rtl = $derived(isRtl(rootRef));

	type ThumbRegistration = { inputRef: () => HTMLInputElement | null };
	const thumbs = new SvelteMap<number, ThumbRegistration>();

	$effect(() => {
		element = rootRef;
	});

	const resolvedStep = $derived(normalizeSliderStep(step));
	const resolvedLargeStep = $derived(
		largeStep !== undefined && Number.isFinite(largeStep) && largeStep > 0
			? largeStep
			: getDefaultLargeStep(min, max, resolvedStep)
	);
	const resolvedLocale = $derived($localeStore);

	if (dev) {
		$effect(() => {
			if (value !== undefined && defaultValue !== undefined) {
				console.warn(
					'[Slider]: Both "value" and "defaultValue" are provided. ' +
						'Use "value" for controlled mode or "defaultValue" for uncontrolled mode, not both.'
				);
			}
		});
	}

	// --- Value ------------------------------------------------------------------------------

	function toValues(val: SliderValue | undefined): number[] | undefined {
		if (val === undefined) return undefined;
		return Array.isArray(val) ? val.slice() : [val];
	}

	// The shape of the value is the consumer's: one thumb reports a number, and a range reports
	// an array, also when the array has one element.
	const initialProp = untrack(() => value);
	const initialDefault = untrack(() => defaultValue);
	const initialSource: SliderValue = initialProp ?? initialDefault ?? untrack(() => min);
	const initialValues = toValues(initialSource) as number[];

	let valuesInternal = $state<number[]>(initialValues);

	// Controlled-ness is opt-in, not inferred: `bind:value` and `value={...}` are the same thing
	// at runtime. The prop wins whenever it is supplied, and the internal state carries only the
	// fully uncontrolled case.
	const currentValues = $derived(
		controlledValue || value !== undefined ? (toValues(value) ?? valuesInternal) : valuesInternal
	);
	const isRange = $derived(
		Array.isArray(controlledValue || value !== undefined ? value : (defaultValue ?? initialSource))
	);

	function toExternal(values: number[]): SliderValue {
		return isRange ? values.slice() : values[0];
	}

	// A `bind:value` that starts undefined gets the value at mount, thus the parent reads the
	// default without a first change.
	$effect(() => {
		if (controlledValue) return;
		untrack(() => {
			if (value === undefined) value = toExternal(valuesInternal);
		});
	});

	function publish(nextValues: number[], details: SliderChangeDetails) {
		if (!controlledValue) {
			valuesInternal = nextValues;
			value = toExternal(nextValues);
		}
		onChange?.(toExternal(nextValues), details);
	}

	/** Returns whether the value changed. */
	function setValueAt(index: number, rawValue: number, details: SliderChangeDetails): boolean {
		if (disabled || readonly) return false;
		if (index < 0 || index >= currentValues.length) return false;

		const bounds = getThumbBounds(currentValues, index, {
			min,
			max,
			step: resolvedStep,
			minStepsBetweenThumbs
		});
		const snapped = snapSliderValue(rawValue, min, max, resolvedStep);
		const nextValue = clampSliderValue(snapped, bounds.min, bounds.max);
		if (nextValue === currentValues[index]) return false;

		const nextValues = currentValues.slice();
		nextValues[index] = nextValue;
		publish(nextValues, details);
		return true;
	}

	function commitValue(details: SliderChangeDetails) {
		onChangeEnd?.(toExternal(currentValues), details);
	}

	function stepValueAt(
		index: number,
		direction: -1 | 1,
		options: { large?: boolean; event?: Event }
	) {
		const current = currentValues[index];
		if (current === undefined) return;
		const delta = options.large ? resolvedLargeStep : resolvedStep;
		const details: SliderChangeDetails = { reason: 'keyboard', index, event: options.event };
		if (setValueAt(index, current + direction * delta, details)) {
			commitValue(details);
		}
	}

	// --- Pointer drag -----------------------------------------------------------------------

	let dragPointerId: number | null = null;
	let dragTarget: HTMLElement | null = null;
	let dragChanged = false;

	function valueFromPointer(event: PointerEvent): number | null {
		if (!trackRef) return null;
		return getSliderValueFromPointer(event, trackRef.getBoundingClientRect(), {
			min,
			max,
			orientation,
			rtl
		});
	}

	function startDrag(event: PointerEvent, index?: number) {
		if (disabled || readonly || event.button !== 0 || !trackRef) return;
		if (dragPointerId !== null) return;

		// The press must not move the focus to the track or select text on the page; the thumb
		// takes the focus below, with the pointer modality.
		event.preventDefault();
		rtl = isRtl(rootRef);

		let targetIndex = index;
		let changed = false;
		if (targetIndex === undefined) {
			const rawValue = valueFromPointer(event);
			if (rawValue === null) return;
			targetIndex = getNearestThumbIndex(currentValues, rawValue);
			changed = setValueAt(targetIndex, rawValue, { reason: 'pointer', index: targetIndex, event });
		}

		const target = event.currentTarget instanceof HTMLElement ? event.currentTarget : trackRef;
		dragPointerId = event.pointerId;
		dragTarget = target;
		dragChanged = changed;
		draggingIndex = targetIndex;

		try {
			target.setPointerCapture(event.pointerId);
		} catch {
			// Synthetic test events and older browsers can fail pointer capture.
		}
		target.addEventListener('pointermove', handleDragMove);
		target.addEventListener('pointerup', handleDragEnd);
		target.addEventListener('pointercancel', handleDragEnd);
		target.addEventListener('lostpointercapture', handleDragEnd);

		focusThumb(targetIndex, 'pointer');
	}

	function handleDragMove(event: PointerEvent) {
		if (event.pointerId !== dragPointerId || draggingIndex === null) return;
		const rawValue = valueFromPointer(event);
		if (rawValue === null) return;
		if (setValueAt(draggingIndex, rawValue, { reason: 'pointer', index: draggingIndex, event })) {
			dragChanged = true;
		}
	}

	function handleDragEnd(event: PointerEvent) {
		if (event.pointerId !== dragPointerId) return;
		const index = draggingIndex;
		const changed = dragChanged;
		stopDrag();
		if (changed && index !== null) {
			commitValue({ reason: 'pointer', index, event });
		}
	}

	function stopDrag() {
		const target = dragTarget;
		if (target) {
			target.removeEventListener('pointermove', handleDragMove);
			target.removeEventListener('pointerup', handleDragEnd);
			target.removeEventListener('pointercancel', handleDragEnd);
			target.removeEventListener('lostpointercapture', handleDragEnd);
			if (dragPointerId !== null && target.hasPointerCapture?.(dragPointerId)) {
				try {
					target.releasePointerCapture(dragPointerId);
				} catch {
					// The capture is gone already.
				}
			}
		}
		dragPointerId = null;
		dragTarget = null;
		dragChanged = false;
		draggingIndex = null;
	}

	$effect(() => {
		if (!disabled && !readonly) return;
		stopDrag();
		if (disabled) {
			focusedIndex = null;
			focusVisible = false;
		}
	});

	$effect(() => () => stopDrag());

	// --- Form reset -------------------------------------------------------------------------

	$effect(() => {
		const firstInput = thumbs.get(0)?.inputRef();
		const formElement = firstInput?.form;
		if (!formElement) return;

		const handleFormReset = () => {
			// The browser resets the native inputs after the `reset` event; re-sync afterwards.
			queueMicrotask(() => {
				if (initialValues.every((initial, index) => initial === currentValues[index])) return;
				publish(initialValues.slice(), { reason: 'form-reset', index: 0 });
			});
		};

		formElement.addEventListener('reset', handleFormReset);
		return () => formElement.removeEventListener('reset', handleFormReset);
	});

	// --- Thumbs and focus -------------------------------------------------------------------

	function focusThumb(index: number, modality: 'keyboard' | 'pointer') {
		const input = thumbs.get(index)?.inputRef();
		if (!input || document.activeElement === input) return;
		focusWithModality(input, modality);
	}

	function getThumbInputId(index: number): string {
		return `${rootId}-thumb-${index}`;
	}

	const thumbInputIds = $derived(
		Array.from(thumbs.keys())
			.sort((a, b) => a - b)
			.map(getThumbInputId)
	);

	const formatter = $derived.by(() => {
		try {
			return new Intl.NumberFormat(resolvedLocale, formatOptions);
		} catch {
			// A locale the runtime does not know, or format options it refuses.
			return new Intl.NumberFormat(undefined, formatOptions);
		}
	});

	function formatValue(val: number): string {
		return formatter.format(val);
	}

	// `formatRange` puts the dash of the locale between the two numbers, and it writes a shared
	// unit or currency one time. A runtime without it gets the two texts with an en dash.
	function formatRange(start: number, end: number): string {
		if (typeof formatter.formatRange === 'function') {
			try {
				return formatter.formatRange(start, end);
			} catch {
				// A range the runtime refuses, for example a start after the end.
			}
		}
		return `${formatValue(start)}–${formatValue(end)}`;
	}

	const sliderContext: SliderContext = {
		instanceId,
		rootId,
		get labelId() {
			return labelId;
		},
		get values() {
			return currentValues;
		},
		get isRange() {
			return isRange;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get step() {
			return resolvedStep;
		},
		get largeStep() {
			return resolvedLargeStep;
		},
		get minStepsBetweenThumbs() {
			return minStepsBetweenThumbs;
		},
		get orientation() {
			return orientation;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isInvalid() {
			return invalid;
		},
		get name() {
			return name;
		},
		get form() {
			return form;
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
		get draggingIndex() {
			return draggingIndex;
		},
		get focusedIndex() {
			return focusedIndex;
		},
		get isFocusVisible() {
			return focusVisible;
		},
		get isRtl() {
			return rtl;
		},
		get trackRef() {
			return trackRef;
		},
		setTrackRef(el) {
			trackRef = el;
		},
		registerLabel(id) {
			labelId = id;
			return () => {
				if (labelId === id) labelId = null;
			};
		},
		registerThumb(options) {
			let index = options.index;
			if (index === undefined) {
				index = 0;
				while (thumbs.has(index)) index += 1;
			}
			thumbs.set(index, { inputRef: options.inputRef });
			const registeredIndex = index;
			return {
				index: registeredIndex,
				unregister: () => {
					if (thumbs.get(registeredIndex)?.inputRef === options.inputRef) {
						thumbs.delete(registeredIndex);
					}
				}
			};
		},
		getThumbInputId,
		get thumbInputIds() {
			return thumbInputIds;
		},
		getPercent(val) {
			return getSliderPercent(val, min, max) * 100;
		},
		formatValue,
		formatRange,
		getValueText(val, index) {
			return getValueText ? getValueText(val, index) : formatValue(val);
		},
		setValueAt,
		stepValueAt,
		commitValue,
		startDrag,
		focusThumb,
		setThumbFocus(index, focused) {
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

	setSliderContext(sliderContext);
	context = sliderContext;

	// The group takes its name from the label, or from the ids the consumer gave, or from the
	// `aria-label`. A thumb with a name of its own points at the group too, thus the screen
	// reader reads "Minimum, Price".
	const groupLabelledBy = $derived(ariaLabelledBy ?? labelId ?? undefined);
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role="group"
	aria-labelledby={groupLabelledBy}
	aria-label={groupLabelledBy ? undefined : ariaLabel}
	class={className}
	data-slider-root="true"
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-invalid={invalid || undefined}
	data-dragging={draggingIndex !== null || undefined}
	data-focus-within={focusedIndex !== null || undefined}
	data-focus-visible={(focusedIndex !== null && focusVisible) || undefined}
>
	{@render children?.()}
</div>
