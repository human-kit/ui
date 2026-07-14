<script lang="ts">
	import ListBox from '../index';

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'mx', name: 'Mexico' }
	];

	const emptyCountries: typeof countries = [];
</script>

<ListBox.Root aria-label="Countries selected" value={['ar']}>
	{#each countries as country (country.id)}
		<ListBox.Item id={country.id} textValue={country.name}>
			{country.name}
		</ListBox.Item>
	{/each}
</ListBox.Root>

<ListBox.Root aria-label="Countries multiple" selectionMode="multiple" value={['ar', 'mx']}>
	{#each countries as country (country.id)}
		<ListBox.Item id={country.id} textValue={country.name}>
			{country.name}
		</ListBox.Item>
	{/each}
</ListBox.Root>

<ListBox.Root
	aria-label="Countries empty"
	items={emptyCountries}
	emptyPlaceholder="Sin coincidencias"
>
	{#snippet children(country)}
		<ListBox.Item id={country.id} textValue={country.name}>
			{country.name}
		</ListBox.Item>
	{/snippet}
</ListBox.Root>

<ListBox.Root aria-label="Countries empty static" emptyPlaceholder="Sin coincidencias static">
	{#each emptyCountries as country (country.id)}
		<ListBox.Item id={country.id} textValue={country.name}>
			{country.name}
		</ListBox.Item>
	{/each}
</ListBox.Root>
