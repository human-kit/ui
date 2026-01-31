<script lang="ts">
	import ComboBox from '../index';

	type Props = {
		isDisabled?: boolean;
		isReadOnly?: boolean;
		trigger?: 'focus' | 'input' | 'press';
	};

	let { isDisabled = false, isReadOnly = false, trigger = 'press' }: Props = $props();

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

<ComboBox {isDisabled} {isReadOnly} {trigger}>
	<ComboBox.Input placeholder="Search countries..." />
	<ComboBox.Button />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each countries as country (country.id)}
				<ComboBox.Item id={country.id} textValue={country.name}>
					{country.name}
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox>

<!-- Button outside the combobox for testing blur behavior -->
<button type="button" data-testid="outside-button">Outside</button>
