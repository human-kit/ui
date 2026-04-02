<script module lang="ts">
	let columnInstanceId = 0;

	function createColumnToken() {
		columnInstanceId += 1;
		return `table-column-${columnInstanceId}`;
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import { setTableColumnContext, useTableContext, useTableSectionContext } from '../root/context';

	type TableColumnProps = {
		id: string;
		allowsSorting?: boolean;
		isRowHeader?: boolean;
		textValue?: string;
		children?: Snippet;
	};

	let {
		id,
		allowsSorting = false,
		isRowHeader = false,
		textValue,
		children
	}: TableColumnProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	const token = createColumnToken();

	if (section.section !== 'header') {
		throw new Error('`Table.Column` must be used inside `Table.Header`.');
	}

	setTableColumnContext({
		token,
		get id() {
			return id;
		},
		get allowsSorting() {
			return allowsSorting;
		},
		get isRowHeader() {
			return isRowHeader;
		},
		get textValue() {
			return textValue;
		}
	});

	function syncColumnRegistration() {
		table.registerColumn({
			token,
			id,
			allowsSorting,
			isRowHeader,
			textValue
		});
	}

	syncColumnRegistration();

	$effect(() => {
		syncColumnRegistration();
	});

	onDestroy(() => {
		table.unregisterColumn(token);
	});
</script>

{#if children}
	{@render children()}
{/if}
