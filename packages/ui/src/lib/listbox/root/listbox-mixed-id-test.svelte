<script lang="ts">
	import ListBox from '../index';

	let selected = $state<(string | number)[]>([]);

	function handleChange(value: Set<string | number>) {
		selected = Array.from(value);
	}
</script>

<ListBox.Root aria-label="Mixed id types" onChange={handleChange}>
	<ListBox.Item id="1">String one</ListBox.Item>
	<ListBox.Item id={1}>Number one</ListBox.Item>
	<ListBox.Item id="2">String two</ListBox.Item>
</ListBox.Root>

<div data-testid="selected">{selected.map((v) => `${typeof v}:${v}`).join(',')}</div>
