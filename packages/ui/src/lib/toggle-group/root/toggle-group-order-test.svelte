<script lang="ts">
	import { Toggle } from '../../toggle/index.js';
	import { ToggleGroup } from '../index';

	let values = $state(['one', 'two', 'three']);
</script>

<ToggleGroup.Root aria-label="Order" data-testid="toggle-group">
	{#each values as value (value)}
		<Toggle.Root {value} data-testid={`toggle-${value}`}>{value}</Toggle.Root>
	{/each}
</ToggleGroup.Root>

<button type="button" data-reverse onclick={() => (values = [...values].reverse())}>
	Reverse
</button>
