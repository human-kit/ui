<script lang="ts">
	import { Checkbox } from '../../checkbox/index.js';
	import { CheckboxGroup } from '../index';
	import type { CheckboxGroupValue } from '../root/context.svelte';

	type Props = {
		defaultValue?: CheckboxGroupValue[];
		onSubmitted?: (values: string[]) => void;
	};

	let { defaultValue, onSubmitted }: Props = $props();

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		onSubmitted?.(data.getAll('colors').map(String));
	}
</script>

<form onsubmit={handleSubmit} data-testid="form">
	<CheckboxGroup.Root name="colors" {defaultValue} aria-label="Colors">
		<Checkbox.Root value="red" aria-label="Red" data-testid="checkbox-red">
			<Checkbox.Indicator>x</Checkbox.Indicator>
			<span>Red</span>
		</Checkbox.Root>
		<Checkbox.Root value="green" aria-label="Green" data-testid="checkbox-green">
			<Checkbox.Indicator>x</Checkbox.Indicator>
			<span>Green</span>
		</Checkbox.Root>
	</CheckboxGroup.Root>
	<button type="submit" data-testid="submit">Submit</button>
</form>
