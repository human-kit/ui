<script lang="ts">
	import { useRatingContext } from '../root/context';
	import type { RatingOutputProps, RatingOutputRenderState } from '../types';

	/**
	 * Rating.Output — the text of the value.
	 *
	 * It renders an `<output>` that points at the root, with `aria-live="off"`: the root reads
	 * its own value, and a live region would read it a second time. The text follows the pointer
	 * while the pointer is on the items, thus the reader sees the value of a press before it.
	 */
	let { children, class: className = '', ...restProps }: RatingOutputProps = $props();

	const ctx = useRatingContext('Rating.Output');

	const text = $derived(ctx.getValueText(ctx.displayValue));
	const renderState = $derived<RatingOutputRenderState>({
		value: ctx.value,
		displayValue: ctx.displayValue,
		count: ctx.count,
		text
	});
</script>

<output
	{...restProps}
	for={ctx.rootId}
	aria-live="off"
	class={className}
	data-rating-output="true"
	data-disabled={ctx.isDisabled || undefined}
>
	{#if children}
		{@render children(renderState)}
	{:else}
		{text}
	{/if}
</output>
