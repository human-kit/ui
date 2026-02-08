<script lang="ts">
	import ListBox from '../index';

	type Props = {
		selectionMode?: 'single' | 'multiple';
		selectionBehavior?: 'toggle' | 'replace';
		disabledIds?: Iterable<string | number>;
	};

	let { selectionMode = 'single', selectionBehavior = 'toggle', disabledIds }: Props = $props();

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'orange', name: 'Orange' }
	];
</script>

<ListBox.Root {selectionMode} {selectionBehavior} {disabledIds} aria-label="Fruits list">
	{#each fruits as fruit (fruit.id)}
		<ListBox.Item id={fruit.id} textValue={fruit.name}>
			{fruit.name}
		</ListBox.Item>
	{/each}
</ListBox.Root>
