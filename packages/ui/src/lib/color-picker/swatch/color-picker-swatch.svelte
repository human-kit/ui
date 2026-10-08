<script lang="ts">
	import { parseColor, toCssColor } from '../root/color';
	import { getColorPickerSwatchListContext, useColorPickerContext } from '../root/context';
	import { watchFocusVisible } from '../../primitives/focus-visible.svelte';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import type { ColorPickerSwatchProps } from '../types';

	/**
	 * ColorPicker.Swatch — one color to choose.
	 *
	 * In a `ColorPicker.SwatchList` the swatch is an option of that list: it takes the color at a
	 * press, at `Enter` and at the space bar. Outside a list the swatch shows a color and answers
	 * nothing. The color is in `--color-picker-swatch-color`, thus your CSS paints it.
	 */
	let {
		color,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		'aria-label': ariaLabel,
		style,
		onclick,
		onkeydown,
		onfocus,
		onblur,
		...restProps
	}: ColorPickerSwatchProps = $props();

	const ctx = useColorPickerContext('ColorPicker.Swatch');
	const list = getColorPickerSwatchListContext();

	let swatchRef: HTMLDivElement | null = $state(null);
	let focused = $state(false);
	let focusVisible = $state(false);

	const registration = list?.register({ elementRef: () => swatchRef, color: () => color });
	const index = registration?.index ?? 0;

	$effect(() => {
		element = swatchRef;
	});

	$effect(() => registration?.unregister);

	const parsed = $derived(parseColor(color));
	const cssColor = $derived(parsed ? toCssColor(parsed) : color);
	const selected = $derived(list ? list.isSelected(color) : false);
	const tabIndex = $derived(list && !ctx.isDisabled && list.isTabStop(index) ? 0 : -1);

	watchFocusVisible({
		isFocused: () => focused,
		element: () => swatchRef,
		set: (visible) => {
			focusVisible = visible;
		}
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onclick?.(event);
		if (event.defaultPrevented || !list) return;
		list.select(color, event);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented || !list) return;

		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				list.select(color, event);
				break;
			case 'ArrowRight':
				event.preventDefault();
				list.moveFocus(index, 1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				list.moveFocus(index, -1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				list.moveFocus(index, 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				list.moveFocus(index, -1);
				break;
			case 'Home':
				event.preventDefault();
				list.moveFocus(index, 'first');
				break;
			case 'End':
				event.preventDefault();
				list.moveFocus(index, 'last');
				break;
			default:
				break;
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onfocus?.(event);
		trackInteractionModality(event, swatchRef);
		focused = true;
		focusVisible = shouldShowFocusVisible(swatchRef);
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onblur?.(event);
		focused = false;
		focusVisible = false;
	}

	const inlineStyle = $derived(
		`--color-picker-swatch-color: ${cssColor};${style ? ` ${style}` : ''}`
	);
</script>

<!-- The swatch is an option of a listbox, and the checker cannot read a role that the context
decides. Outside a list it takes no tabindex at all. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{...restProps}
	bind:this={swatchRef}
	role={list ? 'option' : undefined}
	tabindex={list ? tabIndex : undefined}
	aria-selected={list ? selected : undefined}
	aria-label={list ? (ariaLabel ?? color) : undefined}
	aria-disabled={list && ctx.isDisabled ? true : undefined}
	class={className}
	style={inlineStyle}
	data-color-picker-swatch="true"
	data-color={color}
	data-selected={selected || undefined}
	data-disabled={ctx.isDisabled || undefined}
	data-focused={focused || undefined}
	data-focus-visible={focusVisible || undefined}
	onclick={handleClick}
	onkeydown={handleKeyDown}
	onfocus={handleFocus}
	onblur={handleBlur}
>
	{@render children?.()}
</div>
