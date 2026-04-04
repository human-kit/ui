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
	import {
		setTableColumnContext,
		useTableContext,
		useTableSectionContext,
		type TableColumnWidth
	} from '../root/context';

	type TableColumnProps = {
		id: string;
		allowsSorting?: boolean;
		allowsResizing?: boolean;
		isRowHeader?: boolean;
		textValue?: string;
		width?: TableColumnWidth;
		defaultWidth?: TableColumnWidth;
		minWidth?: number;
		maxWidth?: number;
		children?: Snippet;
	};

	let {
		id,
		allowsSorting = false,
		allowsResizing = false,
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
		get allowsResizing() {
			return allowsResizing;
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
			allowsResizing,
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
