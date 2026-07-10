<script lang="ts">
	import ListBox from '../index';

	// Uncontrolled + bound: no initial value, `bind:value` receives updates.
	let value = $state<(string | number)[] | undefined>(undefined);

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' }
	];
</script>

<ListBox.Root bind:value aria-label="Fruits list">
	{#each fruits as fruit (fruit.id)}
		<ListBox.Item id={fruit.id} textValue={fruit.name}>{fruit.name}</ListBox.Item>
	{/each}
</ListBox.Root>

<output data-testid="bound-value">{(value ?? []).join(',')}</output>
