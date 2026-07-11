<script lang="ts">
	import ComboBox from '../index.js';

	type Props = {
		formatMessage?: (count: number) => string;
		disabledKeys?: string[];
	};

	let { formatMessage, disabledKeys = [] }: Props = $props();

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' }
	];
</script>

<ComboBox.Root>
	<ComboBox.Input placeholder="Search countries..." aria-label="Search countries" />
	<ComboBox.Trigger />
	<ComboBox.Status {formatMessage} />

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
