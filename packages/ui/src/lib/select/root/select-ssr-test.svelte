<script lang="ts">
	import { Select } from '../index';

	const items = [
		{ id: 'apple', label: 'Apple' },
		{ id: 'banana', label: 'Banana' }
	];
</script>

<Select.Root id="fruit" name="fruit" defaultValue="banana" {items} required>
	<Select.Label>Fruit</Select.Label>
	<Select.Trigger>
		<Select.Value />
	</Select.Trigger>
	<Select.Popover>
		<Select.List>
			{#each items as item (item.id)}
				<Select.Item id={item.id}>{item.label}</Select.Item>
			{/each}
		</Select.List>
	</Select.Popover>
</Select.Root>
