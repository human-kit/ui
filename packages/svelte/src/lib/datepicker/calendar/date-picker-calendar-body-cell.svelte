<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Calendar } from '../../calendar';

	type DatePickerCalendarBodyCellProps = ComponentProps<typeof Calendar.BodyCell>;

	let {
		class:
			className = 'h-8 w-8 rounded-md text-sm text-gray-900 hover:bg-gray-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-transparent data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[unavailable=true]:opacity-50 data-[focus-visible=true]:bg-blue-100 data-[focus-visible=true]:text-blue-900 dark:text-white dark:hover:bg-gray-700 dark:data-[disabled=true]:hover:bg-transparent dark:data-[focus-visible=true]:bg-blue-500/20 dark:data-[focus-visible=true]:text-blue-100',
		...restProps
	}: DatePickerCalendarBodyCellProps = $props();
</script>

<Calendar.BodyCell class={className} {...restProps} />
