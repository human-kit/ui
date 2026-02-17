<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Calendar } from '../../calendar';

	type DatePickerCalendarHeadingProps = ComponentProps<typeof Calendar.Heading>;

	let { class: className = 'text-sm font-medium', ...restProps }: DatePickerCalendarHeadingProps =
		$props();
</script>

<Calendar.Heading class={className} {...restProps} />
