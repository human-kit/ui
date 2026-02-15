<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useCalendarContext } from '../root/context';
	import { getCalendarMonthIndex } from '../grid/month-scope';
	import { formatCalendarDate, getTodayUtcDate, parseCalendarDate } from '../root/date-utils';

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
	const isOutsideMonth = $derived.by(() => {
		void $layoutVersion;
		return calendar.isOutsideVisibleRange(date, monthIndex);
	});
	const todayDate = formatCalendarDate(getTodayUtcDate());
	const isToday = $derived(date === todayDate);

	let gridCellElement: HTMLDivElement | undefined;

	$effect(() => {
		if (!isFocused || isDisabled) return;
		if (!gridCellElement) return;
		if (document.activeElement === gridCellElement) return;
		gridCellElement.focus();
	});

	$effect(() => {
		if (!isDisabled) return;
		if (!gridCellElement) return;
		if (document.activeElement !== gridCellElement) return;
		gridCellElement.blur();
	});

	function handleClick() {
		if (isDisabled) return;
		calendar.setFocusedValue(date);
		calendar.selectDate(date);
	}

	function handleFocus() {
		if (isDisabled) return;
		calendar.setFocusedValue(date);
		const hasImplicitFocusMarker = gridCellElement?.dataset.implicitFocus === 'true';
		calendar.setFocusVisible(
			hasImplicitFocusMarker ? false : (gridCellElement?.matches(':focus-visible') ?? false)
		);
		if (hasImplicitFocusMarker && gridCellElement) {
			delete gridCellElement.dataset.implicitFocus;
		}
	}

	function handleMousedown(event: MouseEvent) {
		calendar.setFocusVisible(false);
		if (isDisabled) {
			event.preventDefault();
		}
	}

	function handleMouseenter() {
		if (isDisabled) return;
		calendar.setHoveredValue(date);
	}

	function handleMouseleave() {
		if (isDisabled) return;
		calendar.setHoveredValue(undefined);
	}

	function handleKeydown(event: KeyboardEvent) {
		calendar.handleCellKeydown(event, date);
	}
</script>

<td
	role="presentation"
	data-selected={isSelected || undefined}
	data-focused={isVisuallyFocused || undefined}
	data-disabled={isDisabled || undefined}
	data-unavailable={isUnavailable || undefined}
	data-outside-month={isOutsideMonth || undefined}
	data-range-start={isRangeStart || undefined}
	data-range-end={isRangeEnd || undefined}
	data-in-range={isInRange || undefined}
	{...restProps}
>
	<div
		bind:this={gridCellElement}
		class={className}
		role="gridcell"
		tabindex={isDisabled ? -1 : isFocused ? 0 : -1}
		data-selected={isSelected || undefined}
		data-focused={isVisuallyFocused || undefined}
		data-disabled={isDisabled || undefined}
		data-unavailable={isUnavailable || undefined}
		data-outside-month={isOutsideMonth || undefined}
		data-range-start={isRangeStart || undefined}
		data-range-end={isRangeEnd || undefined}
		data-in-range={isInRange || undefined}
		aria-selected={isSelected}
		aria-disabled={isDisabled || isUnavailable || undefined}
		aria-current={isToday ? 'date' : undefined}
		aria-label={date}
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
</td>
