<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context';
	import { getCalendarMonthIndex } from '../grid/month-scope';
	import CalendarBodyCell from '../body-cell/calendar-body-cell.svelte';

	type CalendarGridBodyProps = {
		children?: Snippet<[string]>;
		class?: string;
	};

	let { children, class: className = '' }: CalendarGridBodyProps = $props();

	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const monthIndex = getCalendarMonthIndex();
	const month = $derived.by(() => {
		void $layoutVersion;
		return calendar.months[monthIndex];
	});
	const weeks = $derived(month?.weeks ?? []);
</script>

<tbody class={className}>
	{#each weeks as week, weekIndex (weekIndex)}
		<tr data-week={weekIndex}>
			{#each week as day (day.date)}
				{#if children}
					{@render children(day.date)}
				{:else}
					<CalendarBodyCell date={day.date} />
				{/if}
			{/each}
		</tr>
	{/each}
</tbody>
