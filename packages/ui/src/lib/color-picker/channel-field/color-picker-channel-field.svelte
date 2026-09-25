<script lang="ts">
	import { useColorPickerContext } from '../root/context';
	import type { ColorPickerChannelFieldProps } from '../types';

	/**
	 * ColorPicker.ChannelField — one channel as a number.
	 *
	 * It is a native number input, thus a screen reader reads it as a spin button and the browser
	 * gives it the arrows of a number field. The limits and the step come from the channel: 0 to
	 * 255 for red, 0 to 360 for the hue, and 0 to 1 for the alpha.
	 */
	let {
		channel,
		class: className = '',
		element = $bindable<HTMLInputElement | null>(null),
		'aria-label': ariaLabel,
		oninput,
		onblur,
		onfocus,
		...restProps
	}: ColorPickerChannelFieldProps = $props();

	const ctx = useColorPickerContext('ColorPicker.ChannelField');

	let inputRef: HTMLInputElement | null = $state(null);
	let focused = $state(false);
	// Whether a key of the reader moved the color while this field had the focus.
	let changedWhileFocused = false;

	$effect(() => {
		element = inputRef;
	});

	const range = $derived(ctx.getChannelRange(channel));
	const value = $derived(ctx.getChannelValue(channel));

	// The color keeps the value: a number the color refuses leaves the field ahead of it, thus
	// the two are made equal again after each change.
	$effect(() => {
		if (inputRef && !focused && inputRef.value !== String(value)) inputRef.value = String(value);
	});

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event as never);
		const next = Number(event.currentTarget.value);
		// An empty field, or a half written number, is not a color yet: it waits for the next key.
		if (event.currentTarget.value === '' || Number.isNaN(next)) return;
		if (ctx.setChannel(channel, next, { reason: 'input', channel, event })) {
			changedWhileFocused = true;
		}
	}

	function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onfocus?.(event as never);
		focused = true;
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onblur?.(event as never);
		focused = false;
		// The field goes back to the color: an empty field, or a number past the limits, is not
		// what the color says.
		const wrote = event.currentTarget.value !== String(value);
		event.currentTarget.value = String(value);
		// A field the reader only passed through changed nothing, and it reports no end.
		if (changedWhileFocused || wrote) ctx.commit({ reason: 'input', channel, event });
		changedWhileFocused = false;
	}
</script>

<input
	{...restProps}
	bind:this={inputRef}
	type="number"
	min={range.min}
	max={range.max}
	step={range.step}
	value={String(value)}
	disabled={ctx.isDisabled}
	readonly={ctx.isReadOnly}
	autocomplete="off"
	aria-label={ariaLabel ?? ctx.getChannelLabel(channel)}
	aria-describedby={ctx.ariaDescribedBy}
	aria-invalid={ctx.isInvalid || undefined}
	class={className}
	data-color-picker-channel-field="true"
	data-channel={channel}
	data-disabled={ctx.isDisabled || undefined}
	data-readonly={ctx.isReadOnly || undefined}
	data-invalid={ctx.isInvalid || undefined}
	data-focused={focused || undefined}
	oninput={handleInput}
	onfocus={handleFocus}
	onblur={handleBlur}
/>
