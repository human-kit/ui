<script lang="ts" generics="T extends object = object">
	import type { ComponentProps } from 'svelte';
	import TransferListList from './transfer-list-list.svelte';

	/**
	 * TransferList.Source - The left-hand list: every item that is not in `value`.
	 */
	type TransferListSourceProps = Omit<ComponentProps<typeof TransferListList<T>>, 'side'>;

	let props: TransferListSourceProps = $props();
</script>

<TransferListList side="source" {...props} />
