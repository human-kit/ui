<script lang="ts">
	import { Checkbox } from '../index';

	type Props = {
		id?: string;
		name?: string;
		value?: string;
		checked?: boolean;
		defaultChecked?: boolean;
		indeterminate?: boolean;
		defaultIndeterminate?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		forceMount?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		onIndeterminateChange?: (indeterminate: boolean) => void;
		onkeyup?: (event: KeyboardEvent) => void;
		onblur?: (event: FocusEvent) => void;
	};

	let {
		id,
		name,
		value = 'newsletter',
		checked = $bindable(),
		defaultChecked = false,
		indeterminate = $bindable(),
		defaultIndeterminate = false,
		disabled = false,
		readonly = false,
		required = false,
		forceMount = false,
		onCheckedChange,
		onIndeterminateChange,
		onkeyup,
		onblur
	}: Props = $props();
</script>

<Checkbox.Root
	{id}
	{name}
	{value}
	bind:checked
	{defaultChecked}
	bind:indeterminate
	{defaultIndeterminate}
	{disabled}
	{readonly}
	{required}
	{onCheckedChange}
	{onIndeterminateChange}
	{onkeyup}
	{onblur}
	class="inline-flex h-5 w-5 items-center justify-center"
	aria-label="Accept terms"
>
	<Checkbox.Indicator {forceMount}>
		<span data-checkbox-icon="true">icon</span>
	</Checkbox.Indicator>
</Checkbox.Root>

<output data-checked-state>{String(checked ?? false)}</output>
<output data-indeterminate-state>{String(indeterminate ?? false)}</output>
