<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useCalendarContext } from '../root/context';
	import CalendarGridMonthScope from './calendar-grid-month-scope.svelte';

	type CalendarGridProps = {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '' }: CalendarGridProps = $props();
	const calendar = useCalendarContext();
	const layoutVersion = calendar.layoutVersion;
	const months = $derived.by(() => {
		void $layoutVersion;
		return calendar.months;
	});
	const selectionMode = $derived.by(() => {
		void $layoutVersion;
		return calendar.selectionMode;
	});
	const isReadOnly = $derived.by(() => {
		void $layoutVersion;
		return calendar.isReadOnly;
	});
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
