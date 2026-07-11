<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { useLocaleContextOptional } from '../../locale-provider/context';
	import { useComboBoxContext } from '../root/context';

	/**
	 * ComboBox.Status - Visually-hidden live region that announces the number of
	 * results visible in the popover to screen readers as the filter changes.
	 *
	 * Mirrors Autocomplete.Status. The announcement only happens while the popover
	 * is open: items live inside the popover and unregister when it unmounts, so a
	 * closed combobox would otherwise incorrectly announce "no results".
	 */
	type ComboBoxStatusProps = {
		/** Build the announced message from the visible item count. */
		formatMessage?: (count: number) => string;
	};

	let { formatMessage }: ComboBoxStatusProps = $props();

	const localeContext = useLocaleContextOptional();
	const emptyLocaleStore = readable<string | undefined>(undefined);
	const localeStore = localeContext?.locale ?? emptyLocaleStore;

	const ctx = useComboBoxContext();

	const visuallyHiddenStyle =
		'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

	const defaultMessage = $derived.by(() => {
		const count = ctx.visibleCount;
		if (count === 0) return resolveLocalizedString($localeStore, 'combobox.noResults');
		if (count === 1) return resolveLocalizedString($localeStore, 'combobox.oneResult');
		return resolveLocalizedString($localeStore, 'combobox.multipleResults', { count });
	});

	const message = $derived(
		ctx.isOpen ? (formatMessage ? formatMessage(ctx.visibleCount) : defaultMessage) : ''
	);
</script>

<span role="status" aria-live="polite" aria-atomic="true" style={visuallyHiddenStyle}>
	{message}
</span>
