<script lang="ts">
	import { Toggle } from '../../toggle/index.js';
	import { ToggleGroup } from '../index';
	import type { ToggleGroupValue } from '../root/context.svelte';

	let value = $state<ToggleGroupValue[]>([]);
</script>

<ToggleGroup.Root bind:value selectionMode="multiple" aria-label="Numeric string toggles">
	<Toggle.Root value={1} data-testid="toggle-number">Number</Toggle.Root>
	<Toggle.Root value="1" data-testid="toggle-string">String</Toggle.Root>
</ToggleGroup.Root>

<output data-current-value>{JSON.stringify(value)}</output>
