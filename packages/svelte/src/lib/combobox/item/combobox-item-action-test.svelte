<script lang="ts">
	import ComboBox, { type ComboBoxItemActionHandler } from '../index';

	type Props = {
		onAction?: ComboBoxItemActionHandler;
		onValueChange?: (value: string | number | null | (string | number)[]) => void;
		closeOnAction?: boolean;
		disabledAction?: boolean;
		filterActionItems?: boolean;
		alwaysRenderAction?: boolean;
		actionTextValue?: string;
	};

	let {
		onAction,
		onValueChange,
		closeOnAction = true,
		disabledAction = false,
		filterActionItems = true,
		alwaysRenderAction = false,
		actionTextValue
	}: Props = $props();

	let inputValue = $state('');
	let selectedValue = $state<string | number | null>(null);

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' }
	];
</script>

<ComboBox.Root
	trigger="input"
	{filterActionItems}
	bind:inputValue
	bind:value={selectedValue}
	onChange={onValueChange}
>
	<ComboBox.Input placeholder="Search countries..." />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#if alwaysRenderAction || inputValue.trim()}
				<ComboBox.Item
					id="create"
					textValue={actionTextValue ?? `Create "${inputValue}"`}
					disabled={disabledAction}
					{onAction}
					{closeOnAction}
				>
					{#if inputValue.trim()}
						Create "{inputValue}"
					{:else}
						Create
					{/if}
				</ComboBox.Item>
			{/if}

			{#each countries as country (country.id)}
				<ComboBox.Item id={country.id} textValue={country.name}>
					{country.name}
				</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<output data-selected-value>{selectedValue === null ? 'null' : String(selectedValue)}</output>
