<script lang="ts">
	import { readable } from 'svelte/store';
	import { SvelteMap } from 'svelte/reactivity';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { isRtl } from '../../internal/rtl';
	import { getLocaleContext } from '../../locale-provider/context';
	import { focusWithModality } from '../../primitives/input-modality';
	import { colorsAreEqual, parseColor } from '../root/color';
	import { setColorPickerSwatchListContext, useColorPickerContext } from '../root/context';
	import type { ColorPickerSwatchListProps } from '../types';

	/**
	 * ColorPicker.SwatchList — a set of colors to choose from.
	 *
	 * The list is a `role="listbox"`, and each `ColorPicker.Swatch` in it is an option. The tab
	 * order holds one swatch, the arrows move between them, and `Enter` or the space bar takes
	 * the color. A press takes it at once.
	 */
	let {
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		'aria-label': ariaLabel,
		...restProps
	}: ColorPickerSwatchListProps = $props();

	const ctx = useColorPickerContext('ColorPicker.SwatchList');
	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	let listRef: HTMLDivElement | null = $state(null);
	let focusedIndex = $state<number | null>(null);

	type SwatchRegistration = { elementRef: () => HTMLElement | null; color: () => string };
	const swatches = new SvelteMap<number, SwatchRegistration>();

	const listId = $derived(ctx.getPartId('swatches'));
	const defaultLabel = $derived(resolveLocalizedString($localeStore, 'colorPicker.swatches'));

	$effect(() => {
		element = listRef;
	});

	function isSelected(color: string): boolean {
		const parsed = parseColor(color);
		if (!parsed) return false;
		return colorsAreEqual(parsed, ctx.hasAlpha ? ctx.color : { ...ctx.color, a: parsed.a });
	}

	/** The swatch of the color, or the first one: the tab order holds one swatch. */
	const selectedIndex = $derived.by(() => {
		for (const [index, swatch] of swatches) {
			if (isSelected(swatch.color())) return index;
		}
		return null;
	});

	function focusIndex(index: number) {
		const node = swatches.get(index)?.elementRef();
		if (!node) return;
		focusedIndex = index;
		focusWithModality(node, 'keyboard');
	}

	setColorPickerSwatchListContext({
		get listId() {
			return listId;
		},
		register(options) {
			let index = 0;
			while (swatches.has(index)) index += 1;
			swatches.set(index, options);
			const registeredIndex = index;
			return {
				index: registeredIndex,
				unregister: () => {
					if (swatches.get(registeredIndex)?.elementRef === options.elementRef) {
						swatches.delete(registeredIndex);
					}
				}
			};
		},
		isTabStop(index) {
			const stop = focusedIndex ?? selectedIndex ?? Math.min(...swatches.keys());
			return index === stop;
		},
		moveFocus(from, step) {
			const indexes = [...swatches.keys()].sort((a, b) => a - b);
			if (indexes.length === 0) return;
			if (step === 'first') {
				focusIndex(indexes[0]);
				return;
			}
			if (step === 'last') {
				focusIndex(indexes[indexes.length - 1]);
				return;
			}
			const direction = isRtl(listRef) ? -step : step;
			const at = indexes.indexOf(from);
			const next = Math.min(Math.max(at + direction, 0), indexes.length - 1);
			focusIndex(indexes[next]);
		},
		select(color, event) {
			if (ctx.isDisabled || ctx.isReadOnly) return;
			if (!ctx.setText(color, { reason: 'swatch', event })) return;
			ctx.commit({ reason: 'swatch', event });
		},
		isSelected
	});

	function handleFocusOut(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget.contains(next)) return;
		// The tab order goes back to the swatch of the color when the focus leaves the list.
		focusedIndex = null;
	}
</script>

<div
	{...restProps}
	bind:this={listRef}
	id={listId}
	role="listbox"
	aria-label={ariaLabel ?? defaultLabel}
	aria-orientation="horizontal"
	aria-disabled={ctx.isDisabled || undefined}
	class={className}
	data-color-picker-swatch-list="true"
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	onfocusout={handleFocusOut}
>
	{@render children?.()}
</div>
