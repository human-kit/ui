<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setTableColumnContext, useTableContext, useTableSectionContext } from '../root/context';
	import type { TableColumnProps } from '../types.js';

	let {
		id,
		allowsSorting = false,
		isRowHeader = false,
		textValue,
		width,
		defaultWidth,
		minWidth,
		maxWidth,
		children
	}: TableColumnProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	const token = table.createInstanceToken('column');

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
		get isHidden() {
			return table.isColumnHidden(id);
		},
		get isRowHeader() {
			return isRowHeader;
		},
		get textValue() {
			return textValue;
		},
		get width() {
			return width;
		},
		get defaultWidth() {
			return defaultWidth;
		},
		get minWidth() {
			return minWidth;
		},
		get maxWidth() {
			return maxWidth;
		}
	});

	function syncColumnRegistration() {
		table.registerColumn({
			token,
			id,
			allowsSorting,
			isRowHeader,
			textValue,
			width,
			defaultWidth,
			minWidth,
			maxWidth
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
