<script lang="ts">
	import { useSliderContext } from '../root/context';
	import type { SliderLabelProps } from '../types';

	/**
	 * Slider.Label — the accessible name of the slider.
	 *
	 * It registers its id with the root, which gives it to the group element as `aria-labelledby`,
	 * and each thumb points at it too. It renders a `<span>` and not a `<label>`, because a
	 * `<label>` names one control and a range has more than one thumb. A press on it puts the
	 * focus on the first thumb, as a `<label>` would.
	 */
	let {
		children,
		class: className = '',
		id: idProp,
		onclick,
		...restProps
	}: SliderLabelProps = $props();

	const ctx = useSliderContext('Slider.Label');
	const id = $derived(idProp ?? `${ctx.rootId}-label`);

	// The returned unregister runs on destroy, and again whenever the id changes.
	$effect(() => ctx.registerLabel(id));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
		onclick?.(event);
		if (event.defaultPrevented || ctx.isDisabled) return;
		ctx.focusThumb(0, 'pointer');
	}
</script>

<span
	{...restProps}
	{id}
	class={className}
	data-slider-label="true"
	data-orientation={ctx.orientation}
	data-disabled={ctx.isDisabled || undefined}
	onclick={handleClick}
>
	{@render children?.()}
</span>
