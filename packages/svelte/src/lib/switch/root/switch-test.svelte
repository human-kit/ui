<script lang="ts">
	import { Switch } from '../index';

	type Props = {
		id?: string;
		name?: string;
		value?: string;
		form?: string;
		isChecked?: boolean;
		defaultChecked?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		required?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		id,
		name,
		value = 'enabled',
		form,
		isChecked = $bindable(),
		defaultChecked = false,
		isDisabled = false,
		isReadOnly = false,
		required = false,
		onCheckedChange
	}: Props = $props();
</script>

<Switch.Root
	{id}
	{name}
	{value}
	{form}
	bind:isChecked
	{defaultChecked}
	{isDisabled}
	{isReadOnly}
	{required}
	{onCheckedChange}
	class="inline-flex h-6 w-10 items-center"
	aria-label="Enable notifications"
>
	<Switch.Thumb>
		<span data-switch-thumb-content="true">thumb</span>
	</Switch.Thumb>
</Switch.Root>

<output data-checked-state>{String(isChecked ?? false)}</output>
