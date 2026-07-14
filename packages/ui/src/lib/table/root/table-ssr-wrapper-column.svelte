<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import {
		useTableSsrWrapperRegistry,
		type TableSsrWrapperColumn
	} from './table-ssr-wrapper-context';

	let { id, header }: TableSsrWrapperColumn = $props();

	const registry = useTableSsrWrapperRegistry();

	function getToken() {
		return `ssr-column-${id}`;
	}

	let registeredToken = getToken();

	function getColumn() {
		return { id, header };
	}

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

<span hidden aria-hidden="true" data-ssr-wrapper-column={id}></span>
