<script lang="ts">
	import { RadioGroup } from '../index';
	import type { RadioGroupValue } from '../root/context.svelte';

	type Props = {
		defaultValue?: RadioGroupValue | null;
		onChange?: (value: RadioGroupValue) => void;
	};

	let { defaultValue, onChange }: Props = $props();

	let mounted = $state(true);
</script>

{#if mounted}
	<RadioGroup.Root {defaultValue} {onChange} aria-label="Size">
		<RadioGroup.Item value="small" aria-label="Small" data-testid="radio-small">
			<RadioGroup.Indicator>x</RadioGroup.Indicator>
			<span>Small</span>
		</RadioGroup.Item>
		<RadioGroup.Item value="medium" aria-label="Medium" data-testid="radio-medium">
			<RadioGroup.Indicator>x</RadioGroup.Indicator>
			<span>Medium</span>
		</RadioGroup.Item>
	</RadioGroup.Root>
{/if}

<button type="button" data-unmount-group onclick={() => (mounted = false)}>Unmount</button>
