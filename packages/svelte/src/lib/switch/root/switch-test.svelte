<script lang="ts">
	import { Switch } from '../index';

	type Props = {
		id?: string;
		name?: string;
		value?: string;
		form?: string;
		checked?: boolean;
		defaultChecked?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	};

	let {
		id,
		name,
		value = 'enabled',
		form,
		checked = $bindable(),
		defaultChecked = false,
		disabled = false,
		readonly = false,
		required = false,
		onCheckedChange
	}: Props = $props();
</script>

<Switch.Root
	{id}
	{name}
	{value}
	{form}
	bind:checked
	{defaultChecked}
	{disabled}
	{readonly}
	{required}
	{onCheckedChange}
	class="inline-flex h-6 w-10 items-center"
	aria-label="Enable notifications"
>
	<Switch.Thumb>
		<span data-switch-thumb-content="true">thumb</span>
	</Switch.Thumb>
</Switch.Root>

<output data-checked-state>{String(checked ?? false)}</output>
