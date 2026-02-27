<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { Calendar } from '../../calendar';
	import { sanitizeDatePickerProps } from '../internal/strict-props';
	import { useDatePickerContext } from '../root/context';

	type ForbiddenCalendarProp =
		| 'selectionMode'
		| 'value'
		| 'defaultValue'
		| 'onChange'
		| 'isDisabled'
		| 'isReadOnly'
		| 'isDateUnavailable';

	type DatePickerCalendarProps = Omit<
		ComponentProps<typeof Calendar.Root>,
		ForbiddenCalendarProp
	> & {
		class?: string;
		children?: Snippet;
	};

	const forbiddenCalendarProps: ForbiddenCalendarProp[] = [
		'selectionMode',
		'value',
		'defaultValue',
		'onChange',
		'isDisabled',
		'isReadOnly',
		'isDateUnavailable'
	];

	let { class: className = '', children, ...unsafeRestProps }: DatePickerCalendarProps = $props();

	const datePicker = useDatePickerContext();
	const restProps = $derived.by(
		() =>
			sanitizeDatePickerProps(
				'Calendar',
				unsafeRestProps as Record<string, unknown>,
				forbiddenCalendarProps
			) as Omit<ComponentProps<typeof Calendar.Root>, ForbiddenCalendarProp>
	);

	function handleChange(nextValue: string) {
		datePicker.setValue(nextValue, 'calendar');
	}
</script>

<Calendar.Root
	selectionMode="single"
	showOutsideDays={false}
	value={datePicker.value ?? undefined}
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
