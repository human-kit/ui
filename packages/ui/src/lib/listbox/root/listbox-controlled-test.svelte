<script lang="ts">
	import { untrack } from 'svelte';
	import ListBox from '../index';

	type Props = {
		initialValue?: (string | number)[];
		/** When true, the parent applies onChange back into `value` (controlled loop). */
		applyChanges?: boolean;
		onChange?: (value: Set<string | number>) => void;
	};

	let { initialValue = ['apple'], applyChanges = false, onChange }: Props = $props();

	let value = $state<(string | number)[]>(untrack(() => [...initialValue]));

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' }
	];

	function handleChange(newSelection: Set<string | number>) {
		onChange?.(newSelection);
		if (applyChanges) {
			value = Array.from(newSelection);
		}
	}
</script>

<!--
	`controlledValue` states the intent: this parent owns the selection and decides whether
	to apply a change, so the component must not write back. It has to be explicit now —
	passing `value` alone reads as an ordinary one-way value and no longer implies it.
-->
<ListBox.Root {value} controlledValue onChange={handleChange} aria-label="Fruits list">
	{#each fruits as fruit (fruit.id)}
		<ListBox.Item id={fruit.id} textValue={fruit.name}>{fruit.name}</ListBox.Item>
	{/each}
</ListBox.Root>

<output data-testid="controlled-value">{value.join(',')}</output>
