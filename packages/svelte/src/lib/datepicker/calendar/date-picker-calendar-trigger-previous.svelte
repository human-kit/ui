<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Calendar } from '../../calendar';

	type DatePickerCalendarTriggerPreviousProps = ComponentProps<typeof Calendar.TriggerPrevious>;

	let {
		class:
			className = 'inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700',
		children,
		...restProps
	}: DatePickerCalendarTriggerPreviousProps = $props();
</script>

<Calendar.TriggerPrevious class={className} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</Calendar.TriggerPrevious>
