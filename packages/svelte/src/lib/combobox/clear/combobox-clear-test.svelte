<script lang="ts">
	import ComboBox from '../index.js';

	let value = $state<string | number | null>('ar');
	let inputValue = $state('Argentina');
	let pending = $state(false);

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' }
	];
</script>

<ComboBox.Root bind:value bind:inputValue {pending}>
	<div class="flex gap-1">
		<ComboBox.Input placeholder="Search countries..." />
		<ComboBox.Clear />
		<ComboBox.Trigger />
	</div>

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each countries as country (country.id)}
				<ComboBox.Item id={country.id} textValue={country.name}>{country.name}</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<button type="button" data-set-pending onclick={() => (pending = true)}>Set pending</button>
<button type="button" data-clear-pending onclick={() => (pending = false)}>Clear pending</button>
<output data-selected-value>{String(value)}</output>
<output data-input-value>{inputValue}</output>
