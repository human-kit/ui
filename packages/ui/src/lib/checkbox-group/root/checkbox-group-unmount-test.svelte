<script lang="ts">
	import { CheckboxGroup } from '../index';
	import type { CheckboxGroupValue } from '../root/context.svelte';

	type Props = {
		defaultValue?: CheckboxGroupValue[];
		onChange?: (value: CheckboxGroupValue[]) => void;
	};

	let { defaultValue, onChange }: Props = $props();

	let mounted = $state(true);
</script>

{#if mounted}
	<CheckboxGroup.Root {defaultValue} {onChange} aria-label="Colors">
		<CheckboxGroup.Item value="red" aria-label="Red" data-testid="checkbox-red">
			<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
			<span>Red</span>
		</CheckboxGroup.Item>
		<CheckboxGroup.Item value="green" aria-label="Green" data-testid="checkbox-green">
			<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
			<span>Green</span>
		</CheckboxGroup.Item>
	</CheckboxGroup.Root>
{/if}

<button type="button" data-unmount-group onclick={() => (mounted = false)}>Unmount</button>
