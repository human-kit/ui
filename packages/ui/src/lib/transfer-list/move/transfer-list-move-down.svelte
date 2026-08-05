<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ReorderButton from './transfer-list-reorder-button.svelte';

	/**
	 * TransferList.MoveDown - Shifts the right-hand selection one position later in `value`.
	 * Disabled while nothing is selected there, or while the selection already ends the list.
	 */
	type TransferListMoveDownProps = Omit<ComponentProps<typeof ReorderButton>, 'direction'>;

	let props: TransferListMoveDownProps = $props();
</script>

<ReorderButton direction="down" {...props} />
