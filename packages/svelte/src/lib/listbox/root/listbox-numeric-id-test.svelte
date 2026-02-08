<script lang="ts">
	import ListBox from '../index';

	let selected = $state<string | number | undefined>();

	function handleChange(value: Set<string | number>) {
		selected = Array.from(value)[0];
	}
</script>

<ListBox.Root aria-label="Codes list" onChange={handleChange}>
	<ListBox.Item id="01">Code 01</ListBox.Item>
	<ListBox.Item id="02">Code 02</ListBox.Item>
	<ListBox.Item id={3}>Code 3</ListBox.Item>
</ListBox.Root>

<div data-testid="selected">{selected === undefined ? '' : String(selected)}</div>
<div data-testid="selected-type">{selected === undefined ? '' : typeof selected}</div>
