<script lang="ts">
	import ComboBox from '../index';

	type ComboBoxFilter = (textValue: string, inputValue: string) => boolean;

	type Props = {
		id?: string;
		disabled?: boolean;
		pending?: boolean;
		readonly?: boolean;
		trigger?: 'focus' | 'input' | 'press';
		filter?: ComboBoxFilter | null;
		disabledKeys?: string[];
		initialValue?: string | number | null;
		defaultValue?: string | number | null | (string | number)[];
		onValueChange?: (value: string | number | null | (string | number)[]) => void;
		onOpenChange?: (open: boolean) => void;
	};

	let {
		id,
		disabled = false,
		pending = false,
		readonly = false,
		trigger = 'press',
		filter,
		disabledKeys = [],
		initialValue,
		defaultValue,
		onValueChange,
		onOpenChange
	}: Props = $props();

	let selectedValue = $state<string | number | null | undefined>((() => initialValue)());

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

<ComboBox.Root
	{id}
	{disabled}
	{pending}
	{readonly}
	{trigger}
	{filter}
	items={countries}
	{defaultValue}
	bind:value={selectedValue}
	onChange={onValueChange}
	{onOpenChange}
>
	<ComboBox.Input placeholder="Search countries..." />
	<ComboBox.Trigger />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each countries as country (country.id)}
				<ComboBox.Item
					id={country.id}
					textValue={country.name}
					disabled={disabledKeys.includes(country.id)}
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
