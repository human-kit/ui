<script lang="ts">
	import { Dialog } from '../index';
	import { ComboBox } from '../../combobox';

	type Props = {
		comboboxAutofocus?: boolean;
		comboboxTrigger?: 'focus' | 'input' | 'press';
	};

	let { comboboxAutofocus = false, comboboxTrigger = 'press' }: Props = $props();

	const countries = [
		{ id: 'ar', name: 'Argentina' },
		{ id: 'br', name: 'Brazil' },
		{ id: 'ca', name: 'Canada' }
	];

	let selectedCountry = $state<string | number | undefined>();
</script>

<Dialog.Root>
	{#snippet children({ close })}
		<Dialog.Trigger>
			<button type="button" data-testid="dialog-trigger">Open Dialog</button>
		</Dialog.Trigger>

		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content class="dialog-content">
				<h3>Select a Country</h3>
				<ComboBox.Root trigger={comboboxTrigger} bind:value={selectedCountry}>
					<div class="flex gap-1">
						<ComboBox.Input
							placeholder="Search countries..."
							autofocus={comboboxAutofocus}
							data-testid="combobox-input"
						/>
						<ComboBox.Button data-testid="combobox-button" />
					</div>
					<ComboBox.Popover>
						<ComboBox.List emptyPlaceholder="No countries found">
							{#each countries as country (country.id)}
								<ComboBox.Item
									id={country.id}
									textValue={country.name}
									data-testid="combobox-item-{country.id}"
								>
									{country.name}
								</ComboBox.Item>
							{/each}
						</ComboBox.List>
					</ComboBox.Popover>
				</ComboBox.Root>
				<div style="margin-top: 16px;">
					<button type="button" onclick={close} data-testid="close-button">Close</button>
				</div>
				<div data-testid="selected-value">{selectedCountry ?? ''}</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/snippet}
</Dialog.Root>
