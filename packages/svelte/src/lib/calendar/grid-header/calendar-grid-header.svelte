<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context';
	import CalendarHeaderCell from '../header-cell/calendar-header-cell.svelte';

	type CalendarGridHeaderProps = {
		children?: Snippet<[string]>;
		class?: string;
	};

	let { children, class: className = '' }: CalendarGridHeaderProps = $props();

	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const weekdays = $derived.by(() => {
		$layoutVersion;
		return calendar.weekdayLabels;
	});
</script>

<thead class={className}>
	<tr>
		{#each weekdays as day}
			{#if children}
				{@render children(day)}
			{:else}
				<CalendarHeaderCell>{day}</CalendarHeaderCell>
			{/if}
		{/each}
	</tr>
</thead>
