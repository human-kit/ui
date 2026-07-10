<script lang="ts">
	import ListBox from '../index';

	type Props = {
		selectionMode?: 'single' | 'multiple';
		selectionBehavior?: 'toggle' | 'replace';
		disabledKeys?: Iterable<string | number>;
		pressedIds?: Iterable<string | number>;
	};

	let {
		selectionMode = 'single',
		selectionBehavior = 'toggle',
		disabledKeys,
		pressedIds
	}: Props = $props();

	const pressedIdSet = $derived(new Set(pressedIds ?? []));

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'orange', name: 'Orange' }
	];
</script>

<ListBox.Root {selectionMode} {selectionBehavior} {disabledKeys} aria-label="Fruits list">
	{#each fruits as fruit (fruit.id)}
		<ListBox.Item
			id={fruit.id}
			textValue={fruit.name}
			pressed={pressedIdSet.has(fruit.id) ? true : undefined}
		>
			{fruit.name}
		</ListBox.Item>
	{/each}
</ListBox.Root>

<!-- Input outside the listbox for testing focus behavior on hover -->
<input type="text" data-testid="outside-input" aria-label="Outside input" />
