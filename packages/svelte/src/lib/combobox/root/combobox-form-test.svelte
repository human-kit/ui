<script lang="ts">
	import ComboBox from '../index';

	let submitCount = $state(0);
	let selectedValue = $state<string | number | null | undefined>();

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' }
	];

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitCount += 1;
	}
</script>

<form onsubmit={handleSubmit}>
	<ComboBox.Root bind:value={selectedValue}>
		<ComboBox.Input aria-label="Country" placeholder="Search countries..." />
		<ComboBox.Trigger />

		<ComboBox.Popover>
			<ComboBox.List>
				{#each countries as country (country.id)}
					<ComboBox.Item id={country.id} textValue={country.name}>
						{country.name}
					</ComboBox.Item>
				{/each}
			</ComboBox.List>
		</ComboBox.Popover>
	</ComboBox.Root>

	<button type="submit">Submit</button>
</form>

<output data-testid="submit-count">{submitCount}</output>
