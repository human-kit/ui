<script lang="ts">
	import { useColorPickerContext } from '../root/context';
	import type { ColorPickerPreviewProps } from '../types';

	/**
	 * ColorPicker.Preview — the color of now.
	 *
	 * It is an element with the color in `--color-picker-swatch-color`, which your CSS paints. It
	 * has no name and no role: the color is already in the fields and in the sliders, and a
	 * second reading of it gives a screen reader user nothing.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		...restProps
	}: ColorPickerPreviewProps = $props();

	const ctx = useColorPickerContext('ColorPicker.Preview');

	let previewRef: HTMLDivElement | null = $state(null);

	$effect(() => {
		element = previewRef;
	});

	const inlineStyle = $derived(
		`--color-picker-swatch-color: ${ctx.cssColor};${style ? ` ${style}` : ''}`
	);
</script>

<div
	{...restProps}
	bind:this={previewRef}
	class={className}
	style={inlineStyle}
	data-color-picker-preview="true"
	data-color={ctx.text}
	data-disabled={ctx.isDisabled || undefined}
>
	{@render children?.()}
</div>
