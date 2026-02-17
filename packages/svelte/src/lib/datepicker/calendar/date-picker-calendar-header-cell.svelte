<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Calendar } from '../../calendar';

	type DatePickerCalendarHeaderCellProps = ComponentProps<typeof Calendar.HeaderCell>;

	let {
		class: className = 'h-8 text-xs font-medium text-gray-500 dark:text-gray-400',
		children,
		...restProps
	}: DatePickerCalendarHeaderCellProps = $props();
</script>

<Calendar.HeaderCell class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</Calendar.HeaderCell>
