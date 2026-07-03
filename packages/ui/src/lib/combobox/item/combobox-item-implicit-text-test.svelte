<script lang="ts">
	import { ComboBox } from '../index';

	let selected = $state<string | number | null>(null);
</script>

<ComboBox.Root bind:value={selected}>
	<ComboBox.Input placeholder="Search countries..." />
	<ComboBox.Trigger />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No countries found">
			<!-- Intentionally omit textValue to validate implicit text extraction -->
			<ComboBox.Item id="ar">Argentina</ComboBox.Item>
			<ComboBox.Item id="br">Brazil</ComboBox.Item>
			<ComboBox.Item id="ca">Canada</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<div data-testid="selected">{selected ?? ''}</div>
