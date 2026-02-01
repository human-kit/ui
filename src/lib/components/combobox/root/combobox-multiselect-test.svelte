<script lang="ts">
	import ComboBox from '../index.js';

	interface Props {
		items?: { id: string; name: string }[];
		value?: (string | number)[];
		onValueChange?: (value: (string | number)[]) => void;
		trigger?: 'focus' | 'input' | 'press';
		closeOnSelect?: boolean;
	}

	let {
		items = [
			{ id: 'apple', name: 'Apple' },
			{ id: 'banana', name: 'Banana' },
			{ id: 'cherry', name: 'Cherry' },
			{ id: 'date', name: 'Date' },
			{ id: 'elderberry', name: 'Elderberry' }
		],
		value = $bindable([]),
		onValueChange,
		trigger = 'press',
		closeOnSelect = false
	}: Props = $props();

	function handleChange(newValue: string | number | (string | number)[] | undefined) {
		if (Array.isArray(newValue)) {
			onValueChange?.(newValue);
		}
	}
</script>

<ComboBox bind:value selectionMode="multiple" {trigger} {closeOnSelect} onChange={handleChange}>
	<div class="combobox-container">
		<ComboBox.Tags>
			{#snippet children({ item })}
				<ComboBox.Tag>
					{item.label}
					<ComboBox.TagRemove />
				</ComboBox.Tag>
			{/snippet}
		</ComboBox.Tags>
		<ComboBox.Input placeholder="Search fruits..." />
		<ComboBox.Button>▼</ComboBox.Button>
	</div>

	<ComboBox.Popover>
		<ComboBox.List>
			{#each items as item (item.id)}
				<ComboBox.Item id={item.id} textValue={item.name}>
					{item.name}
					<ComboBox.ItemIndicator />
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox>

<style>
	.combobox-container {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 4px;
		min-height: 38px;
	}
</style>
