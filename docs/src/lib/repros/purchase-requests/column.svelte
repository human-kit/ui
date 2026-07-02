<script
	lang="ts"
	generics="T extends Record<string, unknown> & { id: string | number } = Record<string, unknown> & { id: string | number }"
>
	import { onDestroy, untrack } from 'svelte';

	import { useTableColumnRegistry } from './context';
	import type { ResolvedColumn, WrapperTableColumnProps } from './types';

	let {
		id,
		header,
		align = 'left',
		rowHeader = false,
		resizable = false,
		width,
		defaultWidth,
		minWidth,
		maxWidth,
		sort,
		cell
	}: WrapperTableColumnProps<T> = $props();

	const registry = useTableColumnRegistry();

	function getToken() {
		return `table-column-${id}`;
	}

	function getColumn(): ResolvedColumn<T> {
		return {
			id,
			header,
			align,
			rowHeader,
			resizable,
			width,
			defaultWidth,
			minWidth,
			maxWidth,
			sort,
			cell
		};
	}

	let registeredToken = getToken();

	function syncRegistration() {
		const nextToken = getToken();

		if (nextToken !== registeredToken) {
			registry.removeColumn(registeredToken);
			registeredToken = nextToken;
		}

		registry.upsertColumn(registeredToken, getColumn());
	}

	untrack(() => {
		syncRegistration();
	});

	$effect(() => {
		untrack(() => {
			syncRegistration();
		});
	});

	onDestroy(() => {
		registry.removeColumn(registeredToken);
	});
</script>
