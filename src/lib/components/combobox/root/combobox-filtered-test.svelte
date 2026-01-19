<script lang="ts">
	import ComboBox from '../index';

	type Props = {
		onInputChange?: (value: string) => void;
		trigger?: 'focus' | 'input' | 'manual';
	};

	let { onInputChange, trigger = 'focus' }: Props = $props();

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

	let filterValue = $state('');
	let selectedValue = $state<Set<string | number>>(new Set());

	const filteredCountries = $derived(
		filterValue === ''
			? countries
			: countries.filter((c) => c.name.toLowerCase().includes(filterValue.toLowerCase()))
	);

	function handleInputChange(val: string) {
		filterValue = val;
		onInputChange?.(val);
	}
</script>

<ComboBox bind:value={selectedValue} {trigger} onInputChange={handleInputChange}>
	<ComboBox.Input placeholder="Search countries..." />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each filteredCountries as country (country.id)}
				<ComboBox.Item id={country.id} textValue={country.name}>
					{country.name}
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox>
