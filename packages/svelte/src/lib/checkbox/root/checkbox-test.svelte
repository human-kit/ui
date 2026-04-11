<script lang="ts">
	import { Checkbox } from '../index';

	type Props = {
		id?: string;
		name?: string;
		value?: string;
		isChecked?: boolean;
		defaultChecked?: boolean;
		isIndeterminate?: boolean;
		defaultIndeterminate?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		required?: boolean;
		keepMounted?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		onIndeterminateChange?: (indeterminate: boolean) => void;
	};

	let {
		id,
		name,
		value = 'newsletter',
		isChecked = $bindable(),
		defaultChecked = false,
		isIndeterminate = $bindable(),
		defaultIndeterminate = false,
		isDisabled = false,
		isReadOnly = false,
		required = false,
		keepMounted = false,
		onCheckedChange,
		onIndeterminateChange
	}: Props = $props();
</script>

<Checkbox.Root
	{id}
	{name}
	{value}
	bind:isChecked
	{defaultChecked}
	bind:isIndeterminate
	{defaultIndeterminate}
	{isDisabled}
	{isReadOnly}
	{required}
	{onCheckedChange}
	{onIndeterminateChange}
	class="inline-flex h-5 w-5 items-center justify-center"
	aria-label="Accept terms"
>
	<Checkbox.Indicator {keepMounted}>
		<span data-checkbox-icon="true">icon</span>
	</Checkbox.Indicator>
</Checkbox.Root>

<output data-checked-state>{String(isChecked ?? false)}</output>
<output data-indeterminate-state>{String(isIndeterminate ?? false)}</output>
