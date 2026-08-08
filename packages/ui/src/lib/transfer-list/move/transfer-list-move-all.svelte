<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import MoveButton from './transfer-list-move-button.svelte';

	/**
	 * TransferList.MoveAll - Moves every movable item of the opposite list to `to`,
	 * selected or not. Items in `disabledKeys` stay where they are.
	 */
	type TransferListMoveAllProps = Omit<ComponentProps<typeof MoveButton>, 'scope'>;

	let props: TransferListMoveAllProps = $props();
</script>

<MoveButton scope="all" {...props} />
