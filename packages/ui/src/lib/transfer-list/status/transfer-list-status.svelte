<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useTransferListContext } from '../root/context';
	import type { TransferListMoveDetails } from '../root/types';

	/**
	 * TransferList.Status - Visually-hidden live region that announces each move.
	 *
	 * Mirrors ComboBox.Status. Without it a move is silent to a screen reader: the items
	 * simply stop existing in one list and appear in another, with nothing said about how
	 * many went or where.
	 */
	type TransferListStatusProps = {
		/** Build the announced message from the completed move. */
		formatMessage?: (details: TransferListMoveDetails, label: string) => string;
	};

	let { formatMessage }: TransferListStatusProps = $props();

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	const ctx = useTransferListContext('TransferList.Status');

	const visuallyHiddenStyle =
		'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

	const message = $derived.by(() => {
		const move = ctx.lastMove;
		if (!move) return '';

		const label = ctx.getLabel(move.to);
		if (formatMessage) return formatMessage(move, label);

		const count = move.keys.length;
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
