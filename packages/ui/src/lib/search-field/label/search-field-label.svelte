<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { useSearchFieldContext } from '../root/context';

	type SearchFieldLabelProps = Omit<HTMLLabelAttributes, 'class' | 'for'> & {
		class?: string;
	};

	/**
	 * SearchField.Label — the accessible name of the input.
	 *
	 * It is a native `<label>` for the input, thus a click on the text moves the focus to the input.
	 */
	let { children, class: className, ...restProps }: SearchFieldLabelProps = $props();

	const ctx = useSearchFieldContext('SearchField.Label');
</script>

<label
	{...restProps}
	for={ctx.inputId}
	class={className}
	data-search-field-label="true"
	data-disabled={ctx.isDisabled || undefined}
>
	{@render children?.()}
</label>
