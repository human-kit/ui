<script lang="ts">
	import ComboBox from '../index.js';

	type Props = {
		pending?: boolean;
	};

	let { pending = false }: Props = $props();

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' }
	];
</script>

<ComboBox.Root {pending}>
	<ComboBox.Input placeholder="Search countries..." />
	<ComboBox.Button />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each countries as country (country.id)}
				<ComboBox.Item id={country.id} textValue={country.name}>{country.name}</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
