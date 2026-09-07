<script lang="ts">
	import { Checkbox } from '../../checkbox/index.js';
	import { CheckboxGroup } from '../index';
	import type { CheckboxGroupContext, CheckboxGroupValue } from '../root/context.svelte';

	type Props = {
		defaultValue?: CheckboxGroupValue[];
		onChange?: (value: CheckboxGroupValue[]) => void;
	};

	let { defaultValue, onChange }: Props = $props();

	let group = $state<CheckboxGroupContext>();

	const allSelected = $derived(Boolean(group?.allSelected));
	const someSelected = $derived(Boolean(group?.someSelected));
</script>

<!-- The parent checkbox sits outside the group on purpose: it is a control over the group and
     not one of its values, so it must not register as one. -->
<Checkbox.Root
	checked={allSelected}
	indeterminate={someSelected}
	controlledChecked
	controlledIndeterminate
	aria-label="All colors"
	data-testid="checkbox-all"
	onCheckedChange={(checked) => {
		if (checked) {
			group?.selectAll();
		} else {
			group?.clearAll();
		}
	}}
>
	<Checkbox.Indicator>x</Checkbox.Indicator>
	<span>All colors</span>
</Checkbox.Root>

<CheckboxGroup.Root
	bind:context={group}
	{defaultValue}
	{onChange}
	aria-label="Colors"
	data-testid="checkbox-group"
>
	<CheckboxGroup.Item value="red" aria-label="Red" data-testid="checkbox-red">
		<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
		<span>Red</span>
	</CheckboxGroup.Item>
	<CheckboxGroup.Item value="green" aria-label="Green" data-testid="checkbox-green">
		<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
		<span>Green</span>
	</CheckboxGroup.Item>
	<CheckboxGroup.Item value="blue" aria-label="Blue" data-testid="checkbox-blue">
		<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
		<span>Blue</span>
	</CheckboxGroup.Item>
</CheckboxGroup.Root>
