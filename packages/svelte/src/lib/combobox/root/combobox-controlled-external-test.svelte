<script lang="ts">
	import ComboBox from '../index';

	const units = [
		{ id: 'box-100', name: 'CAJA X 100' },
		{ id: 'box-5000', name: 'CAJA X 5000' },
		{ id: 'unit', name: 'Unidad' }
	];

	let value = $state<string | null>('box-5000');
	let inputValue = $state('CAJA X 5000');

	function syncExternalValue() {
		value = 'unit';
		inputValue = 'Unidad';
	}
</script>

<ComboBox.Root items={units} bind:value bind:inputValue>
	<ComboBox.Input placeholder="Select unit..." />
	<ComboBox.Trigger />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No units found">
			{#each units as unit (unit.id)}
				<ComboBox.Item id={unit.id} textValue={unit.name}>
					{unit.name}
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<button type="button" data-testid="sync-external-value" onclick={syncExternalValue}>Sync</button>
<button type="button" data-testid="outside-button">Outside</button>
