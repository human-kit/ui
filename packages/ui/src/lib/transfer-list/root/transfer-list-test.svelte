<script lang="ts">
	import { TransferList } from '../index';
	import type { TransferListKey, TransferListMoveDetails } from './types';

	type Fruit = { id: string; name: string };

	type Props = {
		value?: TransferListKey[];
		defaultValue?: TransferListKey[];
		controlledValue?: boolean;
		disabledKeys?: TransferListKey[];
		onChange?: (value: TransferListKey[], details: TransferListMoveDetails) => void;
	};

	let {
		value = $bindable(),
		defaultValue,
		controlledValue,
		disabledKeys,
		onChange
	}: Props = $props();

	const fruits: Fruit[] = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'orange', name: 'Orange' }
	];
</script>

<TransferList.Root
	items={fruits}
	bind:value
	{defaultValue}
	{controlledValue}
	{disabledKeys}
	{onChange}
>
	<TransferList.Source label="Available">
		{#snippet children(fruit: Fruit)}
			<TransferList.Item item={fruit} textValue={fruit.name}>{fruit.name}</TransferList.Item>
		{/snippet}
	</TransferList.Source>

	<TransferList.MoveSelected to="target">Add</TransferList.MoveSelected>
	<TransferList.MoveAll to="target">Add all</TransferList.MoveAll>
	<TransferList.MoveAll to="source">Remove all</TransferList.MoveAll>
	<TransferList.MoveSelected to="source">Remove</TransferList.MoveSelected>

	<TransferList.Target label="Selected">
		{#snippet children(fruit: Fruit)}
			<TransferList.Item item={fruit} textValue={fruit.name}>{fruit.name}</TransferList.Item>
		{/snippet}
	</TransferList.Target>

	<TransferList.Status />
</TransferList.Root>

<button type="button">Outside</button>
