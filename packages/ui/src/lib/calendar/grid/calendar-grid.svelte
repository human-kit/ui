<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context.svelte';
	import type { CalendarWeekdayStyle } from '../root/date-utils';
	import { setCalendarGridContext } from './context';
	import CalendarGridMonthScope from './calendar-grid-month-scope.svelte';

	type CalendarGridProps = {
		children?: Snippet;
		class?: string;
		weekdayStyle?: CalendarWeekdayStyle;
	};

	let { children, class: className = '', weekdayStyle = 'short' }: CalendarGridProps = $props();
	const calendar = useCalendarContext();
	setCalendarGridContext({
		get weekdayStyle() {
			return weekdayStyle;
		}
	});
	const months = $derived(calendar.months);
	const selectionMode = $derived(calendar.selectionMode);
	const isReadOnly = $derived(calendar.isReadOnly);
</script>

<div class={className} data-calendar-grid>
	{#each months as month (month.monthIndex)}
		<div role="group" aria-label={month.heading} data-calendar-month={month.monthIndex}>
			<CalendarGridMonthScope monthIndex={month.monthIndex}>
				<table
					role="grid"
					aria-label={month.heading}
					aria-readonly={isReadOnly || undefined}
					aria-multiselectable={selectionMode === 'range' ? true : undefined}
				>
					{#if children}
						{@render children()}
					{/if}
				</table>
			</CalendarGridMonthScope>
		</div>
	{/each}
</div>
