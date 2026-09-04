<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context.svelte';
	import { getCalendarGridContext } from '../grid/context';
	import CalendarHeaderCell from '../header-cell/calendar-header-cell.svelte';

	type CalendarGridHeaderProps = {
		/**
		 * Your own content for a header cell. It receives the weekday name in the length of
		 * `weekdayStyle`, and also the long weekday name. Use the long name as the accessible name when
		 * the short one is narrow. In some locales, "M" is the narrow name of Monday and of Wednesday.
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
