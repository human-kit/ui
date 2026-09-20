<script lang="ts">
	import { readable } from 'svelte/store';
	import { getLocaleContext } from '../../locale-provider/context';
	import { useSliderContext } from '../root/context';
	import type { SliderOutputProps, SliderOutputRenderState } from '../types';

	/**
	 * Slider.Output — the text of the value.
	 *
	 * It renders an `<output>` that points at the native inputs, with `aria-live="off"`: the
	 * thumbs read their own value, and a live region would read it a second time.
	 */
	let { children, class: className = '', ...restProps }: SliderOutputProps = $props();

	const ctx = useSliderContext('Slider.Output');
	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	const texts = $derived(ctx.values.map((value) => ctx.formatValue(value)));
	// A range of two values is one text in the locale, "25–45", and not two texts with a dash
	// written here. More than two values are a list in the locale.
	const text = $derived.by(() => {
		if (texts.length === 1) return texts[0];
		if (texts.length === 2) return ctx.formatRange(ctx.values[0], ctx.values[1]);
		if (typeof Intl.ListFormat === 'function') {
			return new Intl.ListFormat($localeStore, { type: 'unit', style: 'short' }).format(texts);
		}
		return texts.join(', ');
	});
	const renderState = $derived<SliderOutputRenderState>({ values: ctx.values, texts, text });
</script>

<output
	{...restProps}
	for={ctx.thumbInputIds.join(' ')}
	aria-live="off"
	class={className}
	data-slider-output="true"
	data-orientation={ctx.orientation}
	data-disabled={ctx.isDisabled || undefined}
>
	{#if children}
		{@render children(renderState)}
	{:else}
		{text}
	{/if}
</output>
