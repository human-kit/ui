<script lang="ts">
	import ComboBox from '../index';

	const items = Array.from({ length: 12 }, (_, index) => ({
		id: `item-${index + 1}`,
		name: `Item ${index + 1}`
	}));
</script>

<ComboBox.Root trigger="press">
	<ComboBox.Input placeholder="Search items..." />
	<ComboBox.Trigger />

	<ComboBox.Popover>
		<ComboBox.List class="combobox-test-scroll-list" emptyPlaceholder="No items found">
			{#each items as item (item.id)}
				<ComboBox.Item id={item.id} textValue={item.name}>
					{item.name}
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
