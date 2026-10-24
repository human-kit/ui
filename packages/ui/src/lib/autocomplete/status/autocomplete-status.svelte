<script lang="ts">
	import { useAutocompleteContext } from '../root/context';
	import { visuallyHiddenStyle } from '../../primitives/visually-hidden';

	/**
	 * Autocomplete.Status - Visually-hidden live region that announces the number
	 * of available results to screen readers as the query changes.
	 */
	type AutocompleteStatusProps = {
		/** Makes the announced message from the number of the items that the user sees. */
		formatMessage?: (count: number) => string;
	};

	let {
		formatMessage = (count: number) =>
			count === 0 ? 'No results available' : `${count} result${count === 1 ? '' : 's'} available`
	}: AutocompleteStatusProps = $props();

	const ctx = useAutocompleteContext();
	const message = $derived(formatMessage(ctx.visibleCount));
</script>

<span role="status" aria-live="polite" aria-atomic="true" style={visuallyHiddenStyle}>
	{message}
</span>
