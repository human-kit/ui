<script module lang="ts">
	const ariaDateFormatterCache: Record<string, Intl.DateTimeFormat> = Object.create(null);
	const todayLabelFormatterCache: Record<string, Intl.RelativeTimeFormat> = Object.create(null);

	function getAriaDateFormatter(locale: string): Intl.DateTimeFormat {
		let formatter = ariaDateFormatterCache[locale];
		if (!formatter) {
			formatter = new Intl.DateTimeFormat(locale, {
				dateStyle: 'full',
				timeZone: 'UTC'
			});
			ariaDateFormatterCache[locale] = formatter;
		}
		return formatter;
	}

	function formatAriaDateLabel(locale: string, date: string): string {
		const [yearText, monthText, dayText] = date.split('-');
		const year = Number(yearText);
		const month = Number(monthText);
		const day = Number(dayText);

		if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
			return date;
		}

		const parsed = new Date(Date.UTC(year, month - 1, day));
		if (Number.isNaN(parsed.getTime())) return date;

		return getAriaDateFormatter(locale).format(parsed);
	}

	function getTodayLabelFormatter(locale: string): Intl.RelativeTimeFormat {
		let formatter = todayLabelFormatterCache[locale];
		if (!formatter) {
			formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
			todayLabelFormatterCache[locale] = formatter;
		}
		return formatter;
	}

	function capitalizeLabel(label: string): string {
		return label.charAt(0).toLocaleUpperCase() + label.slice(1);
	}

	function formatTodayDateLabel(locale: string, dateLabel: string): string {
		return `${capitalizeLabel(getTodayLabelFormatter(locale).format(0, 'day'))}, ${dateLabel}`;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCalendarContext } from '../root/context';
	import { getCalendarMonthIndex } from '../grid/month-scope';
	import { formatCalendarDate, getTodayUtcDate, parseCalendarDate } from '../root/date-utils';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type CalendarBodyCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
		date: string;
		children?: Snippet<[string]>;
	};

	let { date, children, class: className = '', ...restProps }: CalendarBodyCellProps = $props();

	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const selectionVersion = calendar.selectionVersion;
	const focusRequestVersion = calendar.focusRequestVersion;
	const monthIndex = getCalendarMonthIndex();

	const parsedDate = $derived(parseCalendarDate(date));
	const dayLabel = $derived(parsedDate ? String(parsedDate.getUTCDate()) : '');
	const isSelected = $derived.by(() => {
		void $layoutVersion;
		void $selectionVersion;
		if (calendar.isDisabled || calendar.isReadOnly) return false;
		return calendar.isSelected(date);
	});
	const isRangeStart = $derived.by(() => {
		void $layoutVersion;
		void $selectionVersion;
		if (calendar.isDisabled || calendar.isReadOnly) return false;
		return calendar.isRangeStart(date);
	});
	const isRangeEnd = $derived.by(() => {
		void $layoutVersion;
		void $selectionVersion;
		if (calendar.isDisabled || calendar.isReadOnly) return false;
		return calendar.isRangeEnd(date);
	});
	const isInRange = $derived.by(() => {
		void $layoutVersion;
		void $selectionVersion;
		if (calendar.isDisabled || calendar.isReadOnly) return false;
		return calendar.isInRange(date);
	});
	const isRovingFocusTarget = $derived.by(() => {
		void $selectionVersion;
		return calendar.focusedValue === date;
	});
	const isFocusVisible = $derived.by(() => {
		void $selectionVersion;
		return calendar.focusVisible;
	});
	let hasDomFocus = $state(false);
	const isVisuallyFocused = $derived(hasDomFocus && isFocusVisible);
	const isDisabled = $derived.by(() => {
		void $layoutVersion;
		void $selectionVersion;
		return calendar.isDateDisabled(date);
	});
	const isUnavailable = $derived.by(() => {
		void $layoutVersion;
		return calendar.isDateUnavailable(date);
	});
	const isAriaDisabled = $derived(isDisabled || isUnavailable);
	const isOutsideMonth = $derived.by(() => {
		void $layoutVersion;
		return calendar.isOutsideVisibleRange(date, monthIndex);
	});
	const showOutsideDays = $derived.by(() => {
		void $layoutVersion;
		return calendar.showOutsideDays;
	});
	const hidesOutsideDay = $derived(isOutsideMonth && !showOutsideDays);
	const isSelectionDisabled = $derived(isDisabled || hidesOutsideDay);
	const isFocusDisabled = $derived(calendar.isDisabled || hidesOutsideDay);
	const todayDate = formatCalendarDate(getTodayUtcDate());
	const isToday = $derived(date === todayDate);
	const ariaDateLabel = $derived.by(() => {
		void $layoutVersion;
		return formatAriaDateLabel(calendar.locale, date);
	});
	const buttonAriaLabel = $derived(
		isToday ? formatTodayDateLabel(calendar.locale, ariaDateLabel) : ariaDateLabel
	);
	const isPressDisabled = $derived(
		isFocusDisabled || isSelectionDisabled || isUnavailable || calendar.isReadOnly
	);

	let buttonElement = $state<HTMLDivElement | undefined>(undefined);
	let isHovered = $state(false);
	let isPressed = $state(false);
	let pressedKey: 'Enter' | 'Space' | null = $state(null);
	let handledFocusRequestVersion = $state(0);

	function clearPressState() {
		isPressed = false;
		pressedKey = null;
	}

	$effect(() => {
		const requestVersion = $focusRequestVersion;
		if (handledFocusRequestVersion === requestVersion) return;
		if (!isRovingFocusTarget || isFocusDisabled) return;
		if (!buttonElement) return;
		handledFocusRequestVersion = requestVersion;
		if (document.activeElement === buttonElement) return;
		buttonElement.focus();
	});

	$effect(() => {
		if (!isFocusDisabled) return;
		isHovered = false;
		clearPressState();
		if (!buttonElement) return;
		if (document.activeElement !== buttonElement) return;
		buttonElement.blur();
	});

	function handleClick() {
		if (isFocusDisabled) return;
		if (document.activeElement !== buttonElement) {
			buttonElement?.focus();
		}
		calendar.setFocusedValue(date);
		if (!isSelectionDisabled) {
			calendar.selectDate(date);
		}
	}

	function handleFocus() {
		if (isFocusDisabled) return;
		hasDomFocus = true;
		calendar.setFocusedValue(date);
		calendar.setFocusVisible(shouldShowFocusVisible(buttonElement ?? null));
	}

	function handleBlur() {
		hasDomFocus = false;
		isHovered = false;
		clearPressState();
		calendar.setFocusVisible(false);
	}

	function handlePointerdown(event: PointerEvent) {
		trackInteractionModality(event, buttonElement ?? null);
		calendar.setFocusVisible(false);
		if (isPressDisabled) {
			event.preventDefault();
			clearPressState();
			return;
		}
		if (event.button !== 0) return;
		isPressed = true;
		pressedKey = null;
	}

	function handlePointerup(event: PointerEvent) {
		if (event.button !== 0) return;
		clearPressState();
	}

	function handlePointercancel() {
		clearPressState();
	}

	function handleMousedown(event: MouseEvent) {
		trackInteractionModality(event, buttonElement ?? null);
		calendar.setFocusVisible(false);
		if (isPressDisabled) {
			event.preventDefault();
			clearPressState();
			return;
		}
		if (event.button !== 0) return;
		isPressed = true;
		pressedKey = null;
	}

	function handleMouseup(event: MouseEvent) {
		if (event.button !== 0) return;
		if (pressedKey === null) {
			clearPressState();
		}
	}

	function handleMouseenter() {
		if (isFocusDisabled) {
			isHovered = false;
			return;
		}
		isHovered = true;
		calendar.setHoveredValue(date);
	}

	function handleMouseleave() {
		isHovered = false;
		if (pressedKey === null) {
			clearPressState();
		}
		if (isFocusDisabled) return;
		calendar.setHoveredValue(undefined);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isFocusDisabled) return;
		trackInteractionModality(event, buttonElement ?? null);

		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (key) {
			if (isPressDisabled) {
				event.preventDefault();
				clearPressState();
				return;
			}

			if (!(event.repeat && isPressed && pressedKey === key)) {
				isPressed = true;
				pressedKey = key;
			}
		}

		calendar.handleCellKeydown(event, date);
	}

	function handleKeyup(event: KeyboardEvent) {
		const key =
			event.key === 'Enter'
				? 'Enter'
				: event.key === ' ' || event.key === 'Spacebar'
					? 'Space'
					: null;

		if (!key) return;
		trackInteractionModality(event, buttonElement ?? null);

		if (pressedKey === key) {
			clearPressState();
		}
	}
</script>

<td
	role={hidesOutsideDay ? 'presentation' : 'gridcell'}
	data-selected={isSelected || undefined}
	data-focused={hasDomFocus || undefined}
	data-focus-visible={isVisuallyFocused || undefined}
	data-hovered={isHovered || undefined}
	data-pressed={isPressed || undefined}
	data-disabled={isAriaDisabled || undefined}
	data-unavailable={isUnavailable || undefined}
	data-outside-month={isOutsideMonth || undefined}
	data-range-start={isRangeStart || undefined}
	data-range-end={isRangeEnd || undefined}
	data-in-range={isInRange || undefined}
	data-today={isToday || undefined}
	data-date={hidesOutsideDay ? undefined : date}
	aria-selected={hidesOutsideDay ? undefined : isSelected}
	aria-disabled={hidesOutsideDay ? undefined : isAriaDisabled || undefined}
	aria-current={!hidesOutsideDay && isToday ? 'date' : undefined}
	{...restProps}
>
	{#if hidesOutsideDay}
		<div
			class={className}
			role="presentation"
			data-disabled={true}
			data-outside-month={true}
			aria-hidden="true"
		></div>
	{:else}
		<div
			bind:this={buttonElement}
			class={className}
			role="button"
			tabindex={isFocusDisabled ? -1 : isRovingFocusTarget ? 0 : -1}
			data-selected={isSelected || undefined}
			data-focused={hasDomFocus || undefined}
			data-focus-visible={isVisuallyFocused || undefined}
			data-hovered={isHovered || undefined}
			data-pressed={isPressed || undefined}
			data-disabled={isAriaDisabled || hidesOutsideDay || undefined}
			data-unavailable={isUnavailable || undefined}
			data-outside-month={isOutsideMonth || undefined}
			data-range-start={isRangeStart || undefined}
			data-range-end={isRangeEnd || undefined}
			data-in-range={isInRange || undefined}
			data-today={isToday || undefined}
			data-date={date}
			aria-disabled={isAriaDisabled || hidesOutsideDay || undefined}
			aria-current={isToday ? 'date' : undefined}
			aria-label={buttonAriaLabel}
			style={isVisuallyFocused ? undefined : 'outline: none;'}
			onpointerdown={handlePointerdown}
			onpointerup={handlePointerup}
			onpointercancel={handlePointercancel}
			onmousedown={handleMousedown}
			onmouseup={handleMouseup}
			onmouseenter={handleMouseenter}
			onmouseleave={handleMouseleave}
			onclick={handleClick}
			onfocus={handleFocus}
			onblur={handleBlur}
			onkeydown={handleKeydown}
			onkeyup={handleKeyup}
		>
			{#if children}
				{@render children(date)}
			{:else}
				{dayLabel}
			{/if}
		</div>
	{/if}
</td>
