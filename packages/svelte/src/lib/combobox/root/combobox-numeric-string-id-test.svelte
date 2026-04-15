<script lang="ts">
	import { ComboBox } from '../index';

	let selected = $state<string | number | undefined>();
</script>

<ComboBox.Root bind:value={selected}>
	<ComboBox.Input placeholder="Search codes..." />
	<ComboBox.Trigger />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No codes found">
			<ComboBox.Item id="01" textValue="Code 01">Code 01</ComboBox.Item>
			<ComboBox.Item id="02" textValue="Code 02">Code 02</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>

<div data-testid="selected">{selected === undefined ? '' : String(selected)}</div>
<div data-testid="selected-type">{selected === undefined ? '' : typeof selected}</div>
