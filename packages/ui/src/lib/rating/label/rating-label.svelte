<script lang="ts">
	import { useRatingContext } from '../root/context';
	import type { RatingLabelProps } from '../types';

	/**
	 * Rating.Label — the accessible name of the rating.
	 *
	 * It registers its id with the root, which gives it to the root element as `aria-labelledby`.
	 * It renders a `<span>` and not a `<label>`, because a `<label>` names one control and a
	 * radio group is a set of them. A press on it puts the focus on the rating.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		onclick,
		...restProps
	}: RatingLabelProps = $props();

	const ctx = useRatingContext('Rating.Label');
	const id = $derived(idProp ?? `${ctx.rootId}-label`);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => ctx.registerLabel(id));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
		onclick?.(event);
		if (event.defaultPrevented || ctx.isDisabled) return;
		ctx.focusValue(ctx.value);
	}
</script>

<span
	{...restProps}
	{id}
	class={className}
	data-rating-label="true"
	data-disabled={ctx.isDisabled || undefined}
	onclick={handleClick}
>
	{@render children?.()}
</span>
