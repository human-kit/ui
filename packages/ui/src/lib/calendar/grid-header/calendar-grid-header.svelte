<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context.svelte';
	import { getCalendarGridContext } from '../grid/context';
	import CalendarHeaderCell from '../header-cell/calendar-header-cell.svelte';

	type CalendarGridHeaderProps = {
		/**
		 * Custom header cell rendering. Receives the styled weekday label (per
		 * `weekdayStyle`) and the long weekday name, useful as an accessible
		 * label when the styled label is narrow (e.g. "M" for both Monday and
		 * Wednesday in some locales).
		 */
		children?: Snippet<[string, string]>;
		class?: string;
	};

	let { children, class: className = '' }: CalendarGridHeaderProps = $props();

	const calendar = useCalendarContext();
	const gridContext = getCalendarGridContext();
	const weekdays = $derived(calendar.getWeekdayLabels(gridContext?.weekdayStyle));
	// Long weekday names disambiguate narrow/short labels for assistive tech.
	const longWeekdays = $derived(calendar.getWeekdayLabels('long'));
</script>

<thead class={className}>
	<tr>
		{#each weekdays as day, index (index)}
			{#if children}
				{@render children(day, longWeekdays[index])}
			{:else}
				<CalendarHeaderCell abbr={longWeekdays[index]} aria-label={longWeekdays[index]}>
					{day}
				</CalendarHeaderCell>
			{/if}
		{/each}
	</tr>
</thead>
