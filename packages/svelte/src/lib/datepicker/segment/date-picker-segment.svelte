<script module lang="ts">
	const monthFormatterCache: Record<string, Intl.DateTimeFormat> = Object.create(null);

	function getMonthFormatter(locale: string): Intl.DateTimeFormat {
		let formatter = monthFormatterCache[locale];
		if (!formatter) {
			formatter = new Intl.DateTimeFormat(locale, {
				month: 'long',
				timeZone: 'UTC'
			});
			monthFormatterCache[locale] = formatter;
		}
		return formatter;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { DatePickerSegmentPart } from '../root/context';
	import { useDatePickerContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type DatePickerSegmentProps = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'children'
		| 'class'
		| 'id'
		| 'role'
		| 'contenteditable'
		| 'tabindex'
		| 'aria-label'
		| 'aria-labelledby'
		| 'aria-valuemin'
		| 'aria-valuemax'
		| 'aria-valuenow'
		| 'aria-valuetext'
		| 'aria-readonly'
		| 'aria-disabled'
		| 'onfocus'
		| 'onblur'
		| 'onmousedown'
		| 'onclick'
		| 'onselectstart'
		| 'onkeydown'
	> & {
		segment: DatePickerSegmentPart;
		class?: string;
	};

	let { segment, class: className = '', ...restProps }: DatePickerSegmentProps = $props();
	let isFocused = $state(false);
	let segmentRef: HTMLSpanElement | null = $state(null);

	const datePicker = useDatePickerContext();

	const isEditableSegment = $derived(segment.type !== 'literal');
	const isActive = $derived(
		isEditableSegment && (datePicker.activeSegment === segment.type || isFocused)
	);
	const isFocusVisible = $derived(isFocused && datePicker.focusVisible);
	const segmentId = $props.id();

	const currentNumericValue = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		const segmentValue = datePicker.getSegmentValue(segment.type);
		if (segmentValue.length === 0) return undefined;
		const value = Number(segmentValue);
		return Number.isFinite(value) ? value : undefined;
	});

	const valueMin = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		if (segment.type === 'month') return 1;
		if (segment.type === 'day') return 1;
		return 1;
	});

	const valueMax = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		if (segment.type === 'month') return 12;
		if (segment.type === 'day') return 31;
		return 9999;
	});

	const valueText = $derived.by(() => {
		if (segment.type === 'literal') return segment.text;
		if (segment.type === 'month' && currentNumericValue) {
			const monthLabel = getMonthFormatter(datePicker.locale).format(
				new Date(Date.UTC(2030, currentNumericValue - 1, 1))
			);
			return `${currentNumericValue} - ${monthLabel}`;
		}
		return segment.text;
	});

	const segmentLabel = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		return datePicker.getSegmentLabel(segment.type);
	});

	$effect(() => {
		if (segment.type === 'literal') return;
		const segmentType = segment.type;
		datePicker.registerSegmentRef(segmentType, segmentRef);
		return () => {
			datePicker.registerSegmentRef(segmentType, null);
		};
	});

	function handleFocus(event: FocusEvent) {
		if (segment.type === 'literal') return;
		if (datePicker.isDisabled) {
			isFocused = false;
			return;
		}
		isFocused = true;
		datePicker.syncFocusWithin();
		datePicker.setFocusVisible(shouldShowFocusVisible(event.currentTarget as HTMLElement));
		datePicker.setActiveSegment(segment.type);
	}

	function handleBlur() {
		if (segment.type === 'literal') return;
		isFocused = false;
		queueMicrotask(() => {
			datePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (segment.type === 'literal') return;
		if (datePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		datePicker.setFocusVisible(false);
		event.preventDefault();
		const target = event.currentTarget as HTMLElement;
		target.focus();
		datePicker.setActiveSegment(segment.type);
	}

	function handleClick(event: MouseEvent) {
		if (segment.type === 'literal') return;
		if (datePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		const target = event.currentTarget as HTMLElement;
		target.focus();
		datePicker.setActiveSegment(segment.type);
	}

	function handleSelectStart(event: Event) {
		if (!segment.isPlaceholder) return;
		event.preventDefault();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (segment.type === 'literal') return;
		if (datePicker.isDisabled) return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		datePicker.setFocusVisible(true);

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			if (!datePicker.focusNextSegment(segment.type)) {
				datePicker.triggerRef?.focus();
			}
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			datePicker.focusPreviousSegment(segment.type);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			datePicker.adjustSegmentValue(segment.type, 1);
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			datePicker.adjustSegmentValue(segment.type, -1);
			return;
		}

		if (event.key === 'PageUp') {
			event.preventDefault();
			const step = segment.type === 'year' ? 10 : 5;
			datePicker.adjustSegmentValue(segment.type, step);
			return;
		}

		if (event.key === 'PageDown') {
			event.preventDefault();
			const step = segment.type === 'year' ? 10 : 5;
			datePicker.adjustSegmentValue(segment.type, -step);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			if (segment.type === 'month') {
				datePicker.setSegmentValue('month', '1');
			} else if (segment.type === 'day') {
				datePicker.setSegmentValue('day', '1');
			} else {
				datePicker.setSegmentValue('year', '1');
			}
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			if (segment.type === 'month') {
				datePicker.setSegmentValue('month', '12');
			} else if (segment.type === 'day') {
				datePicker.setSegmentValue('day', '31');
			} else {
				datePicker.setSegmentValue('year', '9999');
			}
			return;
		}

		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			const currentValue = datePicker.getSegmentValue(segment.type);
			if (currentValue.length === 0) {
				if (event.key === 'Backspace') {
					datePicker.focusPreviousSegment(segment.type);
				}
				return;
			}
			datePicker.setSegmentValue(segment.type, currentValue.slice(0, -1));
			return;
		}

		if (event.key.length === 1 && /\d/.test(event.key)) {
			event.preventDefault();
			const didComplete = datePicker.typeSegmentDigit(segment.type, event.key);
			if (didComplete) {
				datePicker.focusNextSegment(segment.type);
			}
			return;
		}

		if (event.key === '/' || event.key === '-' || event.key === '.') {
			event.preventDefault();
			const currentValue = datePicker.getSegmentValue(segment.type);
			if (currentValue.length === 0) {
				return;
			}
			datePicker.focusNextSegment(segment.type);
			return;
		}

		if (event.key === 'Tab') {
			return;
		}

		event.preventDefault();
	}
</script>

{#if segment.type === 'literal'}
	<span
		class={className}
		{...restProps}
		data-placeholder={segment.isPlaceholder || undefined}
		data-type={segment.type}
		aria-hidden="true"
	>
		{segment.text}
	</span>
{:else}
	<span
		bind:this={segmentRef}
		id={segmentId}
		class={className}
		{...restProps}
		data-date-picker-segment="true"
		data-placeholder={segment.isPlaceholder || undefined}
		data-type={segment.type}
		data-focused={isActive ? 'true' : undefined}
		data-focus-visible={isFocusVisible ? 'true' : undefined}
		role="spinbutton"
		aria-valuetext={valueText}
		aria-valuemin={valueMin}
		aria-valuemax={valueMax}
		aria-valuenow={currentNumericValue}
		aria-label={segmentLabel}
		aria-readonly={datePicker.isReadOnly || undefined}
		aria-disabled={datePicker.isDisabled || undefined}
		contenteditable={!datePicker.isDisabled && !datePicker.isReadOnly}
		spellcheck="false"
		enterkeyhint="next"
		inputmode="numeric"
		tabindex={datePicker.isDisabled ? -1 : 0}
		style={segment.isPlaceholder
			? 'caret-color: transparent; user-select: none;'
			: 'caret-color: transparent;'}
		onfocus={handleFocus}
		onblur={handleBlur}
		onmousedown={handleMouseDown}
		onclick={handleClick}
		onselectstart={handleSelectStart}
		onkeydown={handleKeydown}
	>
		{segment.text}
	</span>
{/if}
