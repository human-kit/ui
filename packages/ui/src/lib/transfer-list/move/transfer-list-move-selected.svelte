<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import MoveButton from './transfer-list-move-button.svelte';

	/**
	 * TransferList.MoveSelected - Moves the selected items of the opposite list to `to`.
	 * Disabled while that list has nothing movable selected.
	 */
	type TransferListMoveSelectedProps = Omit<ComponentProps<typeof MoveButton>, 'scope'>;

	let props: TransferListMoveSelectedProps = $props();
</script>

<MoveButton scope="selected" {...props} />
