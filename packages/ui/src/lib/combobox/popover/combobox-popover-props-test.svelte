<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ComboBox from '../index';
	import type { PopoverContent } from '../../popover';

	type Props = {
		offset?: number;
		placement?: ComponentProps<typeof PopoverContent>['placement'];
		shouldFlip?: boolean;
		shouldCloseOnEscape?: boolean;
	};

	let {
		offset = 8,
		placement = 'bottom-start',
		shouldFlip = true,
		shouldCloseOnEscape = true
	}: Props = $props();

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' }
	];
</script>

<ComboBox.Root trigger="press">
	<ComboBox.Input placeholder="Search countries..." />
	<ComboBox.Trigger />

	<ComboBox.Popover {offset} {placement} {shouldFlip} {shouldCloseOnEscape}>
		<ComboBox.List emptyPlaceholder="No countries found">
			{#each countries as country (country.id)}
				<ComboBox.Item id={country.id} textValue={country.name}>{country.name}</ComboBox.Item>
			{/each}
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
