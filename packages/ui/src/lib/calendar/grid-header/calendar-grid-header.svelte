<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context.svelte';
	import { getCalendarGridContext } from '../grid/context';
	import CalendarHeaderCell from '../header-cell/calendar-header-cell.svelte';

	type CalendarGridHeaderProps = {
		children?: Snippet<[string]>;
		class?: string;
	};

	let { children, class: className = '' }: CalendarGridHeaderProps = $props();

	const calendar = useCalendarContext();
	const gridContext = getCalendarGridContext();
	const weekdays = $derived(calendar.getWeekdayLabels(gridContext?.weekdayStyle));
</script>

<thead class={className}>
	<tr>
		{#each weekdays as day, index (index)}
			{#if children}
				{@render children(day)}
			{:else}
				<CalendarHeaderCell>{day}</CalendarHeaderCell>
			{/if}
		{/each}
	</tr>
</thead>
