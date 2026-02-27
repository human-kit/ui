<script module lang="ts">
	const ariaDateFormatterCache = new Map<string, Intl.DateTimeFormat>();

	function getAriaDateFormatter(locale: string): Intl.DateTimeFormat {
		let formatter = ariaDateFormatterCache.get(locale);
		if (!formatter) {
			formatter = new Intl.DateTimeFormat(locale, {
				dateStyle: 'full',
				timeZone: 'UTC'
			});
			ariaDateFormatterCache.set(locale, formatter);
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
	const isFocused = $derived.by(() => {
		void $selectionVersion;
		return calendar.focusedValue === date;
	});
	const isFocusVisible = $derived.by(() => {
		void $selectionVersion;
		return calendar.focusVisible;
	});
	const isVisuallyFocused = $derived(isFocused && isFocusVisible);
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

	let gridCellElement = $state<HTMLDivElement | undefined>(undefined);

	$effect(() => {
		if (!isFocused || isFocusDisabled) return;
		if (!gridCellElement) return;
		if (document.activeElement === gridCellElement) return;
		gridCellElement.focus();
	});

	$effect(() => {
		if (!isFocusDisabled) return;
		if (!gridCellElement) return;
		if (document.activeElement !== gridCellElement) return;
		gridCellElement.blur();
	});

	function handleClick() {
		if (isFocusDisabled) return;
		calendar.setFocusedValue(date);
		if (!isSelectionDisabled) {
			calendar.selectDate(date);
		}
	}

	function handleFocus() {
		if (isFocusDisabled) return;
		calendar.setFocusedValue(date);
		calendar.setFocusVisible(shouldShowFocusVisible(gridCellElement ?? null));
	}

	function handleMousedown(event: MouseEvent) {
		trackInteractionModality(event, gridCellElement ?? null);
		calendar.setFocusVisible(false);
		if (isSelectionDisabled) {
			event.preventDefault();
		}
	}

	function handleMouseenter() {
		if (isFocusDisabled) return;
		calendar.setHoveredValue(date);
	}

	function handleMouseleave() {
		if (isFocusDisabled) return;
		calendar.setHoveredValue(undefined);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isFocusDisabled) return;
		trackInteractionModality(event, gridCellElement ?? null);
		calendar.handleCellKeydown(event, date);
	}
</script>

<td
	role="presentation"
	data-selected={isSelected || undefined}
	data-focused={isFocused || undefined}
	data-focus-visible={isVisuallyFocused || undefined}
	data-disabled={isAriaDisabled || undefined}
	data-unavailable={isUnavailable || undefined}
	data-outside-month={isOutsideMonth || undefined}
	data-range-start={isRangeStart || undefined}
	data-range-end={isRangeEnd || undefined}
	data-in-range={isInRange || undefined}
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
			bind:this={gridCellElement}
			class={className}
			role="gridcell"
			tabindex={isFocusDisabled ? -1 : isFocused ? 0 : -1}
			data-selected={isSelected || undefined}
			data-focused={isFocused || undefined}
			data-focus-visible={isVisuallyFocused || undefined}
			data-disabled={isAriaDisabled || hidesOutsideDay || undefined}
			data-unavailable={isUnavailable || undefined}
			data-outside-month={isOutsideMonth || undefined}
			data-range-start={isRangeStart || undefined}
			data-range-end={isRangeEnd || undefined}
			data-in-range={isInRange || undefined}
			data-date={date}
			aria-selected={isSelected}
			aria-disabled={isAriaDisabled || hidesOutsideDay || undefined}
			aria-current={isToday ? 'date' : undefined}
			aria-label={ariaDateLabel}
			style={isVisuallyFocused ? undefined : 'outline: none;'}
			onmousedown={handleMousedown}
			onmouseenter={handleMouseenter}
			onmouseleave={handleMouseleave}
			onclick={handleClick}
			onfocus={handleFocus}
			onkeydown={handleKeydown}
		>
			{#if children}
				{@render children(date)}
			{:else}
				{dayLabel}
			{/if}
		</div>
	{/if}
</td>
