<script lang="ts">
	import ComboBox from '../index';

	const items = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brasil' },
		{ id: 'co', name: 'Colombia' }
	];

	let value = $state<string | number | null>(null);
	let created = $state(0);
</script>

<!-- The shape a "Create …" row takes in this app: an action item in the list header, above
	options the list renders itself. -->
<ComboBox.Root {items} bind:value trigger="focus">
	<ComboBox.Input aria-label="Países" />
	<ComboBox.Popover>
		<ComboBox.List {items}>
			{#snippet header()}
				<ComboBox.Item id="create" textValue="Crear país" onAction={() => (created += 1)}>
					Crear país
				</ComboBox.Item>
			{/snippet}
			{#snippet children(item: { id: string; name: string })}
				<ComboBox.Item id={item.id} textValue={item.name}>
					{item.name}
				</ComboBox.Item>
			{/snippet}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<output data-created>{created}</output>
