<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Calendar } from '../../calendar';
	import { useDatePickerContext } from '../root/context';

	type DatePickerCalendarProps = {
		class?: string;
		children?: Snippet;
	} & Record<string, unknown>;

	let { class: className = '', children, ...restProps }: DatePickerCalendarProps = $props();

	const datePicker = useDatePickerContext();

	function handleChange(nextValue: string) {
		datePicker.setValue(nextValue, 'calendar');
	}
</script>

<Calendar.Root
	selectionMode="single"
	showOutsideDays={false}
	value={datePicker.value}
	onChange={handleChange}
	isDisabled={datePicker.isDisabled}
	isReadOnly={datePicker.isReadOnly}
	isDateUnavailable={datePicker.isDateUnavailable}
	class={className}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</Calendar.Root>
