<script lang="ts" generics="T extends object = object">
	import type { ComponentProps } from 'svelte';
	import TransferListList from './transfer-list-list.svelte';

	/**
	 * TransferList.Target - The right-hand list, rendered in `value` order so items keep
	 * the sequence they were moved in.
	 */
	type TransferListTargetProps = Omit<ComponentProps<typeof TransferListList<T>>, 'side'>;

	let props: TransferListTargetProps = $props();
</script>

<TransferListList side="target" {...props} />
