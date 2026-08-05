<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ReorderButton from './transfer-list-reorder-button.svelte';

	/**
	 * TransferList.MoveUp - Shifts the right-hand selection one position earlier in `value`.
	 * Disabled while nothing is selected there, or while the selection already starts the list.
	 */
	type TransferListMoveUpProps = Omit<ComponentProps<typeof ReorderButton>, 'direction'>;

	let props: TransferListMoveUpProps = $props();
</script>

<ReorderButton direction="up" {...props} />
