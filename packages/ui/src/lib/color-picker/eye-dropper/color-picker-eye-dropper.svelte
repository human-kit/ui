<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { getLocaleContext } from '../../locale-provider/context';
	import { useColorPickerContext } from '../root/context';
	import type { ColorPickerEyeDropperProps } from '../types';

	/**
	 * ColorPicker.EyeDropper — takes a color from the screen.
	 *
	 * The browser opens its own eye dropper, and the color of the press becomes the color of the
	 * picker. A browser without the eye dropper gets a button with `data-unsupported`, which your
	 * CSS can hide. Test for it before you make it the one way to choose a color.
	 */
	type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> };

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		'aria-label': ariaLabel,
		onclick,
		...restProps
	}: ColorPickerEyeDropperProps = $props();

	const ctx = useColorPickerContext('ColorPicker.EyeDropper');
	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	let buttonRef: HTMLButtonElement | null = $state(null);
	let open = $state(false);

	// The window is not reactive: the test runs one time, at the start. The server has no window,
	// thus the server writes `data-unsupported` and the browser does not.
	const supported = $derived(typeof window !== 'undefined' && 'EyeDropper' in window);

	$effect(() => {
		element = buttonRef;
	});

	const defaultLabel = $derived(resolveLocalizedString($localeStore, 'colorPicker.eyeDropper'));

	async function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event as never);
		if (event.defaultPrevented || ctx.isDisabled || ctx.isReadOnly || open) return;

		const constructor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
		if (!constructor) return;

		open = true;
		try {
			const result = await new constructor().open();
			if (ctx.setText(result.sRGBHex, { reason: 'eye-dropper', event })) {
				ctx.commit({ reason: 'eye-dropper', event });
			}
		} catch {
			// The user pressed Escape, or the browser refused the eye dropper.
		} finally {
			open = false;
		}
	}
</script>

<button
	{...restProps}
	bind:this={buttonRef}
	type="button"
	disabled={ctx.isDisabled || ctx.isReadOnly}
	aria-label={ariaLabel ?? defaultLabel}
	aria-describedby={ctx.ariaDescribedBy}
	class={className}
	data-color-picker-eye-dropper="true"
	data-open={open || undefined}
	data-unsupported={!supported || undefined}
	data-disabled={ctx.isDisabled || undefined}
	onclick={handleClick}
>
	{@render children?.()}
</button>
