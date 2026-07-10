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
	import type { DatePickerSegmentPart, DateRangePickerRangePart } from '../root/context';
	import { useDateRangePickerContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { isRtl } from '../../internal/rtl';

	type DateRangePickerSegmentProps = Omit<
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
		| 'aria-invalid'
		| 'onfocus'
		| 'onblur'
		| 'onmousedown'
		| 'onclick'
		| 'onselectstart'
		| 'onkeydown'
		| 'onbeforeinput'
	> & {
		part: DateRangePickerRangePart;
		segment: DatePickerSegmentPart;
		class?: string;
	};

	let {
		part,
		segment,
		class: className = '',
		...restProps
	}: DateRangePickerSegmentProps = $props();
	let isFocused = $state(false);
	let segmentRef: HTMLSpanElement | null = $state(null);

	const dateRangePicker = useDateRangePickerContext();

	const isEditableSegment = $derived(segment.type !== 'literal');
	const isActive = $derived(
		isEditableSegment &&
			((dateRangePicker.activeSegment?.part === part &&
				dateRangePicker.activeSegment?.type === segment.type) ||
				isFocused)
	);
	const isFocusVisible = $derived(isFocused && dateRangePicker.focusVisible);
	const segmentId = $props.id();

	const currentNumericValue = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		const segmentValue = dateRangePicker.getSegmentValue(part, segment.type);
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
			const monthLabel = getMonthFormatter(dateRangePicker.locale).format(
				new Date(Date.UTC(2030, currentNumericValue - 1, 1))
			);
			return `${currentNumericValue} - ${monthLabel}`;
		}
		return segment.text;
	});

	const segmentLabel = $derived.by(() => {
		if (segment.type === 'literal') return undefined;
		return dateRangePicker.getSegmentLabel(segment.type);
	});

	const isPartInvalid = $derived(isEditableSegment && dateRangePicker.isPartInvalid(part));

	$effect(() => {
		if (segment.type === 'literal') return;
		const segmentType = segment.type;
		dateRangePicker.registerSegmentRef(part, segmentType, segmentRef);
		return () => {
			dateRangePicker.registerSegmentRef(part, segmentType, null);
		};
	});

	function handleFocus(event: FocusEvent) {
		if (segment.type === 'literal') return;
		if (dateRangePicker.isDisabled) {
			isFocused = false;
			(event.currentTarget as HTMLElement | null)?.blur();
			dateRangePicker.syncFocusWithin();
			dateRangePicker.setFocusVisible(false);
			return;
		}
		isFocused = true;
		dateRangePicker.syncFocusWithin();
		dateRangePicker.setFocusVisible(shouldShowFocusVisible(event.currentTarget as HTMLElement));
		dateRangePicker.setActiveSegment(part, segment.type);
	}

	function handleBlur() {
		if (segment.type === 'literal') return;
		isFocused = false;
		queueMicrotask(() => {
			dateRangePicker.syncFocusWithin();
		});
	}

	function handleMouseDown(event: MouseEvent) {
		if (segment.type === 'literal') return;
		if (dateRangePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		dateRangePicker.setFocusVisible(false);
		event.preventDefault();
		const target = event.currentTarget as HTMLElement;
		target.focus();
		dateRangePicker.setActiveSegment(part, segment.type);
	}

	function handleClick(event: MouseEvent) {
		if (segment.type === 'literal') return;
		if (dateRangePicker.isDisabled) {
			event.preventDefault();
			return;
		}
		const target = event.currentTarget as HTMLElement;
		target.focus();
		dateRangePicker.setActiveSegment(part, segment.type);
	}

	function handleSelectStart(event: Event) {
		if (!segment.isPlaceholder) return;
		event.preventDefault();
	}

	function handleBeforeInput(event: InputEvent) {
		if (segment.type === 'literal') return;
		// The segment DOM stays authoritative: direct mutations from paste,
		// drop, or IME composition are blocked. Android/virtual keyboards
		// deliver digits through `beforeinput` instead of trusted keydown
		// events, so single-digit insertions are routed to the typing path.
		event.preventDefault();
		if (dateRangePicker.isDisabled || dateRangePicker.isReadOnly) return;
		if (event.inputType !== 'insertText') return;
		if (!event.data || !/^\d$/.test(event.data)) return;
		const didComplete = dateRangePicker.typeSegmentDigit(part, segment.type, event.data);
		if (didComplete) {
			dateRangePicker.focusNextSegment(part, segment.type);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (segment.type === 'literal') return;
		if (dateRangePicker.isDisabled) return;
		// Never intercept browser/OS shortcuts (copy, select all, reload, ...).
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		trackInteractionModality(event, event.currentTarget as HTMLElement);
		dateRangePicker.setFocusVisible(true);

		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault();
			// Segments follow the locale's logical order in the DOM: under RTL
			// the visually next segment is the previous logical one, so the
			// physical arrows are inverted.
			const rtl = isRtl(event.currentTarget as HTMLElement);
			const isNext = rtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
			if (isNext) {
				if (!dateRangePicker.focusNextSegment(part, segment.type)) {
					dateRangePicker.triggerRef?.focus();
				}
				return;
			}
			dateRangePicker.focusPreviousSegment(part, segment.type);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			dateRangePicker.adjustSegmentValue(part, segment.type, 1);
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			dateRangePicker.adjustSegmentValue(part, segment.type, -1);
			return;
		}

		if (event.key === 'PageUp') {
			event.preventDefault();
			const step = segment.type === 'year' ? 10 : 5;
			dateRangePicker.adjustSegmentValue(part, segment.type, step);
			return;
		}

		if (event.key === 'PageDown') {
			event.preventDefault();
			const step = segment.type === 'year' ? 10 : 5;
			dateRangePicker.adjustSegmentValue(part, segment.type, -step);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			if (segment.type === 'month') {
				dateRangePicker.setSegmentValue(part, 'month', '1');
			} else if (segment.type === 'day') {
				dateRangePicker.setSegmentValue(part, 'day', '1');
			} else {
				dateRangePicker.setSegmentValue(part, 'year', '1');
			}
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			if (segment.type === 'month') {
				dateRangePicker.setSegmentValue(part, 'month', '12');
			} else if (segment.type === 'day') {
				dateRangePicker.setSegmentValue(part, 'day', '31');
			} else {
				dateRangePicker.setSegmentValue(part, 'year', '9999');
			}
			return;
		}

		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			const currentValue = dateRangePicker.getSegmentValue(part, segment.type);
			if (currentValue.length === 0) {
				if (event.key === 'Backspace') {
					dateRangePicker.focusPreviousSegment(part, segment.type);
				}
				return;
			}
			dateRangePicker.setSegmentValue(part, segment.type, currentValue.slice(0, -1));
			return;
		}

		if (event.key.length === 1 && /\d/.test(event.key)) {
			event.preventDefault();
			const didComplete = dateRangePicker.typeSegmentDigit(part, segment.type, event.key);
			if (didComplete) {
				dateRangePicker.focusNextSegment(part, segment.type);
			}
			return;
		}

		if (event.key === '/' || event.key === '-' || event.key === '.') {
			event.preventDefault();
			const currentValue = dateRangePicker.getSegmentValue(part, segment.type);
			if (currentValue.length === 0) {
				return;
			}
			dateRangePicker.focusNextSegment(part, segment.type);
			return;
		}

		// Only swallow unhandled printable characters. Function keys (Tab,
		// Escape, Enter, F5, ...) keep their default behavior so the browser,
		// forms, and enclosing popovers still receive them.
		if (event.key.length > 1) {
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
		data-date-range-picker-segment="true"
		data-range-part={part}
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
		aria-readonly={dateRangePicker.isReadOnly || undefined}
		aria-disabled={dateRangePicker.isDisabled || undefined}
		aria-invalid={isPartInvalid || undefined}
		contenteditable={!dateRangePicker.isDisabled && !dateRangePicker.isReadOnly}
		spellcheck="false"
		enterkeyhint="next"
		inputmode="numeric"
		tabindex={dateRangePicker.isDisabled ? -1 : 0}
		style={segment.isPlaceholder
			? 'caret-color: transparent; user-select: none;'
			: 'caret-color: transparent;'}
		onfocus={handleFocus}
		onblur={handleBlur}
		onmousedown={handleMouseDown}
		onclick={handleClick}
		onselectstart={handleSelectStart}
		onkeydown={handleKeydown}
		onbeforeinput={handleBeforeInput}
	>
		{segment.text}
	</span>
{/if}
