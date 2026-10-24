<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useTransferListContext } from '../root/context';
	import type { TransferListMoveDetails } from '../root/types';
	import { visuallyHiddenStyle } from '../../primitives/visually-hidden';

	/**
	 * TransferList.Status - Visually-hidden live region that announces each move.
	 *
	 * Mirrors ComboBox.Status. Without it a move is silent to a screen reader: the items
	 * simply stop existing in one list and appear in another, with nothing said about how
	 * many went or where.
	 */
	type TransferListStatusProps = {
		/** Makes the announced message from the move. */
		formatMessage?: (details: TransferListMoveDetails, label: string) => string;
	};

	let { formatMessage }: TransferListStatusProps = $props();

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	const ctx = useTransferListContext('TransferList.Status');

	const message = $derived.by(() => {
		const move = ctx.lastMove;
		if (!move) return '';

		const label = ctx.getLabel(move.to);
		if (formatMessage) return formatMessage(move, label);

		const count = move.keys.length;

		// A reorder is silent otherwise: the rows are still there, only their order changed,
		// and nothing about that reaches a screen reader on its own.
		if (move.type === 'reorder') {
			const key =
				move.direction === 'up'
					? count === 1
						? 'transferList.itemMovedUp'
						: 'transferList.itemsMovedUp'
					: count === 1
						? 'transferList.itemMovedDown'
						: 'transferList.itemsMovedDown';
			return resolveLocalizedString($localeStore, key, { count });
		}

		return count === 1
			? resolveLocalizedString($localeStore, 'transferList.itemMoved', { label })
			: resolveLocalizedString($localeStore, 'transferList.itemsMoved', { count, label });
	});
</script>

<!-- Tagged because it is not the only live region on the page: every ButtonRoot ships one
	for its pending state, so "the status element" is ambiguous without this. -->
<span
	data-transfer-list-status
	role="status"
	aria-live="polite"
	aria-atomic="true"
	style={visuallyHiddenStyle}
>
	{message}
</span>
