<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		setTableColumnContext,
		useTableContext,
		useTableSectionContext
	} from '../root/context.svelte';
	import type { TableColumnProps } from '../types.js';

	let {
		id,
		rowHeader = false,
		textValue,
		width,
		defaultWidth,
		minWidth,
		maxWidth,
		pin,
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
		get isHidden() {
			return table.isColumnHidden(id);
		},
		get isRowHeader() {
			return rowHeader;
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
		},
		get pin() {
			return pin;
		}
	});

	function syncColumnRegistration() {
		table.registerColumn({
			token,
			id,
			isRowHeader: rowHeader,
			textValue,
			width,
			defaultWidth,
			minWidth,
			maxWidth,
			pin
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
