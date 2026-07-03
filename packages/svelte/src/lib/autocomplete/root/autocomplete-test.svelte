<script lang="ts">
	import Autocomplete from '../index';

	type AutocompleteFilter = (textValue: string, inputValue: string) => boolean;

	type Props = {
		id?: string;
		disabled?: boolean;
		readonly?: boolean;
		filter?: AutocompleteFilter | null;
		autoHighlight?: boolean;
		selectionMode?: 'single' | 'multiple';
		disabledKeys?: string[];
		defaultValue?: string[];
		onValueChange?: (value: (string | number)[]) => void;
	};

	let {
		id,
		disabled = false,
		readonly = false,
		filter,
		autoHighlight = true,
		selectionMode = 'single',
		disabledKeys = [],
		defaultValue,
		onValueChange
	}: Props = $props();

	let selectedValue = $state<(string | number)[]>([]);

	const fruits = [
		{ id: 'apple', name: 'Apple' },
		{ id: 'banana', name: 'Banana' },
		{ id: 'cherry', name: 'Cherry' },
		{ id: 'grape', name: 'Grape' },
		{ id: 'lemon', name: 'Lemon' },
		{ id: 'mango', name: 'Mango' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'peach', name: 'Peach' }
	];

	function handleChange(value: Set<string | number>) {
		selectedValue = Array.from(value);
		onValueChange?.(selectedValue);
	}
</script>

<Autocomplete.Root {id} {disabled} {readonly} {filter} {autoHighlight} aria-label="Fruits">
	<Autocomplete.Input placeholder="Search fruits..." aria-label="Search fruits" />
	<Autocomplete.Status />
	<Autocomplete.List {selectionMode} {defaultValue} {disabledKeys} onChange={handleChange}>
		{#each fruits as fruit (fruit.id)}
			<Autocomplete.Item
				id={fruit.id}
				textValue={fruit.name}
				disabled={disabledKeys.includes(fruit.id)}
			>
				<!-- Nested content to exercise clicks landing on child elements -->
				<span data-testid={`label-${fruit.id}`}>{fruit.name}</span>
				<Autocomplete.ItemIndicator />
			</Autocomplete.Item>
		{/each}
		<Autocomplete.Empty>No fruits found</Autocomplete.Empty>
	</Autocomplete.List>
</Autocomplete.Root>

<output data-selected-value>{selectedValue.join(',')}</output>

<!-- Button outside the autocomplete for testing blur behavior -->
<button type="button" data-testid="outside-button">Outside</button>
