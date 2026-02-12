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
		$layoutVersion;
		$selectionVersion;
		if (calendar.isDisabled || calendar.isReadOnly) return false;
		return calendar.isSelected(date);
	});
	const isFocused = $derived.by(() => {
		$selectionVersion;
		return calendar.focusedValue === date;
	});
	const isDisabled = $derived.by(() => {
		$layoutVersion;
		return calendar.isDateDisabled(date);
	});
	const isUnavailable = $derived.by(() => {
		$layoutVersion;
		return calendar.isDateUnavailable(date);
	});
	const isOutsideMonth = $derived.by(() => {
		$layoutVersion;
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
	}

	function handleMousedown(event: MouseEvent) {
		if (!isDisabled) return;
		event.preventDefault();
	}

	function handleKeydown(event: KeyboardEvent) {
		calendar.handleCellKeydown(event, date);
	}
</script>

<td
	role="presentation"
	class={className}
	data-selected={isSelected || undefined}
	data-focused={isFocused || undefined}
	data-disabled={isDisabled || undefined}
	data-unavailable={isUnavailable || undefined}
	data-outside-month={isOutsideMonth || undefined}
	{...restProps}
>
	<div
		bind:this={gridCellElement}
		role="gridcell"
		tabindex={isDisabled ? -1 : isFocused ? 0 : -1}
		aria-selected={isSelected}
		aria-disabled={isDisabled || undefined}
		aria-current={isToday ? 'date' : undefined}
		aria-label={date}
		onmousedown={handleMousedown}
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
