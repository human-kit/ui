<script lang="ts">
	import ComboBox from '../index';

	type Props = {
		id?: string;
		isDisabled?: boolean;
		isPending?: boolean;
		isReadOnly?: boolean;
		trigger?: 'focus' | 'input' | 'press';
		disabledIds?: string[];
	};

	let {
		id,
		isDisabled = false,
		isPending = false,
		isReadOnly = false,
		trigger = 'press',
		disabledIds = []
	}: Props = $props();

	let selectedValue = $state<string | number | undefined>();

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' },
		{ id: 'fr', name: 'France' },
		{ id: 'de', name: 'Germany' },
		{ id: 'it', name: 'Italy' },
		{ id: 'jp', name: 'Japan' },
		{ id: 'mx', name: 'Mexico' },
		{ id: 'es', name: 'Spain' },
		{ id: 'us', name: 'United States' }
	];
</script>

<ComboBox.Root {id} {isDisabled} {isPending} {isReadOnly} {trigger} bind:value={selectedValue}>
	<ComboBox.Input placeholder="Search countries..." />
	<ComboBox.Trigger />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each countries as country (country.id)}
				<ComboBox.Item
					id={country.id}
					textValue={country.name}
					disabled={disabledIds.includes(country.id)}
				>
					{country.name}
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<output data-selected-value
	>{selectedValue === undefined ? 'undefined' : String(selectedValue)}</output
>

<!-- Button outside the combobox for testing blur behavior -->
<button type="button" data-testid="outside-button">Outside</button>
