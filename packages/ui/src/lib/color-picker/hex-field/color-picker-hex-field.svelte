<script lang="ts">
	import { readable } from 'svelte/store';
	import { resolveLocalizedString } from '../../internal/localized-strings';
	import { getLocaleContext } from '../../locale-provider/context';
	import { useColorPickerContext } from '../root/context';
	import { toHexText } from '../root/color';
	import type { ColorPickerHexFieldProps } from '../types';

	/**
	 * ColorPicker.HexField — the color as a hex text.
	 *
	 * What the user writes stays in the field until the field answers: a color is read at `Enter`
	 * and when the focus leaves. A text that names no color goes back to the color of the picker,
	 * thus the field cannot hold a text that is not the color.
	 */
	let {
		class: className = '',
		element = $bindable<HTMLInputElement | null>(null),
		'aria-label': ariaLabel,
		oninput,
		onkeydown,
		onblur,
		onfocus,
		...restProps
	}: ColorPickerHexFieldProps = $props();

	const ctx = useColorPickerContext('ColorPicker.HexField');
	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);
	const defaultLabel = $derived(resolveLocalizedString($localeStore, 'colorPicker.hex'));

	let inputRef: HTMLInputElement | null = $state(null);
	let focused = $state(false);
	let draft = $state<string | null>(null);

	$effect(() => {
		element = inputRef;
	});

	const text = $derived(toHexText(ctx.color, ctx.hasAlpha));
	const shown = $derived(draft ?? text);

	function commitDraft(event: Event) {
		const next = draft;
		draft = null;
		if (next === null || next === text) return;
		// A text that names no color changes nothing, and an end of a change that did not happen
		// is an end the consumer must not hear.
		if (!ctx.setText(next, { reason: 'input', event })) return;
		ctx.commit({ reason: 'input', event });
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event as never);
		draft = event.currentTarget.value;
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event as never);
		if (event.defaultPrevented) return;
		if (event.key === 'Enter') {
			event.preventDefault();
			commitDraft(event);
		} else if (event.key === 'Escape' && draft !== null) {
			event.preventDefault();
			draft = null;
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onfocus?.(event as never);
		focused = true;
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event as never);
		focused = false;
		commitDraft(event);
	}
</script>

<input
	{...restProps}
	bind:this={inputRef}
	type="text"
	value={shown}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	autocomplete="off"
	autocorrect="off"
	autocapitalize="off"
	spellcheck="false"
	aria-label={ariaLabel ?? defaultLabel}
	aria-describedby={ctx.ariaDescribedBy}
	aria-invalid={ctx.isInvalid || undefined}
	class={className}
	data-color-picker-hex-field="true"
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-focused={focused || undefined}
	oninput={handleInput}
	onkeydown={handleKeyDown}
	onfocus={handleFocus}
	onblur={handleBlur}
/>
