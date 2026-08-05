<script lang="ts">
	import ListBox from '../index';

	type Row = { id: number; name: string };

	type Props = {
		count?: number;
		/** Off by default so a test can prove the range stops without it. */
		withItemKey?: boolean;
	};

	let { count = 500, withItemKey = true }: Props = $props();

	const rows: Row[] = $derived(
		Array.from({ length: count }, (_, index) => ({
			id: index,
			name: `Row ${index}`
		}))
	);
</script>

<ListBox.Root
	items={rows}
	getItemKey={withItemKey ? (row: Row) => row.id : undefined}
	virtualizer={{ rowHeight: 24, overscan: 2 }}
	selectionMode="multiple"
	aria-label="Rows"
	class="listbox"
	style="height: 120px; overflow-y: auto;"
>
	{#snippet children(row: Row)}
		<ListBox.Item id={row.id} textValue={row.name}>{row.name}</ListBox.Item>
	{/snippet}
</ListBox.Root>

<!-- Somewhere off the list to park the real pointer, which otherwise steals focus on hover. -->
<input type="text" data-testid="outside-input" aria-label="Outside input" />
