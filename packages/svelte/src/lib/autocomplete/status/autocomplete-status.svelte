<script lang="ts">
	import { useAutocompleteContext } from '../root/context';

	/**
	 * Autocomplete.Status - Visually-hidden live region that announces the number
	 * of available results to screen readers as the query changes.
	 */
	type AutocompleteStatusProps = {
		/** Build the announced message from the visible item count. */
		formatMessage?: (count: number) => string;
	};

	let {
		formatMessage = (count: number) =>
			count === 0 ? 'No results available' : `${count} result${count === 1 ? '' : 's'} available`
	}: AutocompleteStatusProps = $props();

	const visuallyHiddenStyle =
		'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';

	const ctx = useAutocompleteContext();
	const message = $derived(formatMessage(ctx.visibleCount));
</script>

<span role="status" aria-live="polite" aria-atomic="true" style={visuallyHiddenStyle}>
	{message}
</span>
