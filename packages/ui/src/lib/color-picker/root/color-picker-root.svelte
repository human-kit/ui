<script lang="ts">
	import { untrack } from 'svelte';
	import { readable } from 'svelte/store';
	import { dev } from '../../internal/environment';
	import {
		resolveLocalizedString,
		type LocalizedStringKey
	} from '../../internal/localized-strings';
	import { getLocaleContext } from '../../locale-provider/context';
	import type { ColorPickerRootProps } from '../types';
	import {
		setColorPickerContext,
		type ColorPickerChangeDetails,
		type ColorPickerContext
	} from './context';
	import {
		BLACK,
		COLOR_CHANNEL_RANGES,
		clampColor,
		colorsAreEqual,
		formatColor,
		getColorChannel,
		getRoundedChannel,
		parseColor,
		toCssColor,
		withColorChannel,
		type Color,
		type ColorChannel
	} from './color';

	/**
	 * ColorPicker.Root — the color, and the context of each control.
	 *
	 * The color is held as hue, saturation and brightness: the square of `ColorPicker.Area` keeps
	 * its shape at each hue in that model, and it does not in red-green-blue. The value that goes
	 * out is text, in the format of `format`. A color without a hue, black or a gray, keeps the
	 * hue it had, thus a thumb in the square does not jump back to the corner.
	 */
	const generatedId = $props.id();

	let {
		id: idProp,
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onChangeEnd,
		format = 'hex',
		alpha = false,
		disabled = false,
		readonly = false,
		invalid = false,
		name,
		form,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		'aria-describedby': ariaDescribedBy,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		context = $bindable(),
		style,
		...restProps
	}: ColorPickerRootProps = $props();

	const localeStore = getLocaleContext()?.locale ?? readable<string | undefined>(undefined);

	const instanceId = untrack(() => idProp) ?? generatedId;
	const rootId = `color-picker-${instanceId}`;

	let rootRef: HTMLDivElement | null = $state(null);
	let hiddenInputRef: HTMLInputElement | null = $state(null);
	let labelId: string | null = $state(null);

	const resolvedLocale = $derived($localeStore);

	$effect(() => {
		element = rootRef;
	});

	// Read one time: the component writes the value back, thus a check that follows the value
	// would report the echo of its own write.
	if (dev && untrack(() => value !== undefined && defaultValue !== undefined)) {
		console.warn(
			'[ColorPicker]: Both "value" and "defaultValue" are provided. ' +
				'Use "value" for controlled mode or "defaultValue" for uncontrolled mode, not both.'
		);
	}

	// --- Color --------------------------------------------------------------------------------

	const initialColor =
		parseColor(untrack(() => value) ?? untrack(() => defaultValue) ?? '') ?? BLACK;
	let colorInternal = $state<Color>(initialColor);

	// The text that goes out last. A `bind:value` sends it back, and a hue of 360, a black and a
	// gray do not survive the way out and back: the color that made the text is the true one.
	let lastText = untrack(() => formatColor(initialColor, format, alpha));

	// The text of the value is not a color: two texts of the same color are the same color, and
	// a text that names no color leaves the one that is there. Thus the color of the prop is
	// read, and the hue of a black kept, instead of a replacement of the state on each write.
	const controlled = $derived(controlledValue || value !== undefined);
	const currentColor = $derived.by(() => {
		if (!controlled) return colorInternal;
		if (value === lastText) return colorInternal;
		const parsed = parseColor(value ?? '');
		if (!parsed) return colorInternal;
		if (colorsAreEqual(parsed, colorInternal)) return colorInternal;
		// A text of a black or a gray says nothing about the hue: the one on the screen stays.
		return parsed.s === 0 || parsed.b === 0
			? {
					...parsed,
					h: parsed.h || colorInternal.h,
					s: parsed.b === 0 ? colorInternal.s : parsed.s
				}
			: parsed;
	});

	const text = $derived(formatColor(currentColor, format, alpha));
	const cssColor = $derived(toCssColor(currentColor));
	const hueColor = $derived(toCssColor({ h: currentColor.h, s: 100, b: 100, a: 1 }));

	// A `bind:value` that starts undefined gets the value at mount, thus the parent reads the
	// default without a first change.
	$effect(() => {
		if (controlledValue) return;
		untrack(() => {
			if (value === undefined) value = text;
		});
	});

	// A change of `format` or of `alpha` is a change of the text, and of nothing else. The value
	// goes out again, thus the parent does not hold the text of the format that is gone.
	$effect(() => {
		const next = text;
		if (controlledValue || next === lastText) return;
		untrack(() => {
			lastText = next;
			value = next;
		});
	});

	function setColor(next: Color, details: ColorPickerChangeDetails): boolean {
		if (disabled || readonly) return false;
		const clamped = clampColor(next);
		if (colorsAreEqual(clamped, currentColor)) return false;
		const nextText = formatColor(clamped, format, alpha);
		colorInternal = clamped;
		lastText = nextText;
		if (!controlledValue) value = nextText;
		onChange?.(nextText, details);
		return true;
	}

	function setChannel(
		channel: ColorChannel,
		channelValue: number,
		details: ColorPickerChangeDetails
	): boolean {
		return setColor(withColorChannel(currentColor, channel, channelValue), {
			...details,
			channel
		});
	}

	function stepChannel(
		channel: ColorChannel,
		direction: -1 | 1,
		options: { large?: boolean; event?: Event }
	): boolean {
		const range = COLOR_CHANNEL_RANGES[channel];
		const step = options.large ? range.largeStep : range.step;
		const current = getColorChannel(currentColor, channel);
		let next = current + direction * step;
		// The hue is a circle: one step past the end is one step past the start.
		if (channel === 'hue') next = next < 0 ? next + 360 : next > 360 ? next - 360 : next;
		return setChannel(channel, next, { reason: 'keyboard', event: options.event });
	}

	function setText(nextText: string, details: ColorPickerChangeDetails): boolean {
		const parsed = parseColor(nextText);
		if (!parsed) return false;
		// A text without an alpha in a picker that holds one keeps the alpha that is there.
		const next =
			alpha && !/^(#([\da-f]{4}|[\da-f]{8})|rgba|hsla|hsba|hsva)/i.test(nextText.trim())
				? { ...parsed, a: currentColor.a }
				: parsed;
		setColor(next, details);
		return true;
	}

	function commit(details: ColorPickerChangeDetails) {
		onChangeEnd?.(text, details);
	}

	// --- Form reset ---------------------------------------------------------------------------

	$effect(() => {
		const formElement = hiddenInputRef?.form;
		if (!formElement) return;

		const handleFormReset = () => {
			// The browser resets the native inputs after the `reset` event; re-sync afterwards.
			queueMicrotask(() => {
				if (colorsAreEqual(currentColor, initialColor)) return;
				colorInternal = initialColor;
				const initialText = formatColor(initialColor, format, alpha);
				lastText = initialText;
				if (!controlledValue) value = initialText;
				onChange?.(initialText, { reason: 'form-reset' });
			});
		};

		formElement.addEventListener('reset', handleFormReset);
		return () => formElement.removeEventListener('reset', handleFormReset);
	});

	// --- Text of the channels -------------------------------------------------------------------

	const CHANNEL_KEYS: Record<ColorChannel, LocalizedStringKey> = {
		hue: 'colorPicker.hue',
		saturation: 'colorPicker.saturation',
		brightness: 'colorPicker.brightness',
		lightness: 'colorPicker.lightness',
		alpha: 'colorPicker.alpha',
		red: 'colorPicker.red',
		green: 'colorPicker.green',
		blue: 'colorPicker.blue'
	};

	function channelLabel(channel: ColorChannel): string {
		return resolveLocalizedString(resolvedLocale, CHANNEL_KEYS[channel]);
	}

	function channelValueText(channel: ColorChannel): string {
		const channelValue = getRoundedChannel(currentColor, channel);
		if (channel === 'hue') return `${channelValue}°`;
		if (channel === 'alpha') return `${Math.round(channelValue * 100)}%`;
		if (channel === 'red' || channel === 'green' || channel === 'blue') return String(channelValue);
		return `${channelValue}%`;
	}

	function channelPercent(channel: ColorChannel): number {
		const range = COLOR_CHANNEL_RANGES[channel];
		const channelValue = getColorChannel(currentColor, channel);
		// The percent goes into the CSS: a number with the noise of the binary fractions in it is a
		// value of a custom property that reads as broken.
		return Math.round(((channelValue - range.min) / (range.max - range.min)) * 10000) / 100;
	}

	// --- Context ------------------------------------------------------------------------------

	const pickerContext: ColorPickerContext = {
		instanceId,
		rootId,
		get labelId() {
			return labelId;
		},
		get color() {
			return currentColor;
		},
		get text() {
			return text;
		},
		get cssColor() {
			return cssColor;
		},
		get hueColor() {
			return hueColor;
		},
		get format() {
			return format;
		},
		get hasAlpha() {
			return alpha;
		},
		get isDisabled() {
			return disabled;
		},
		get isReadOnly() {
			return readonly;
		},
		get isInvalid() {
			return invalid;
		},
		get ariaLabel() {
			return ariaLabel;
		},
		get ariaLabelledBy() {
			return ariaLabelledBy;
		},
		get ariaDescribedBy() {
			return ariaDescribedBy;
		},
		registerLabel(id) {
			labelId = id;
			return () => {
				if (labelId === id) labelId = null;
			};
		},
		getPartId(part) {
			return `${rootId}-${part}`;
		},
		getChannelRange(channel) {
			return COLOR_CHANNEL_RANGES[channel];
		},
		getChannelValue(channel) {
			return getRoundedChannel(currentColor, channel);
		},
		getChannelPercent: channelPercent,
		getChannelLabel: channelLabel,
		getChannelValueText: channelValueText,
		getChannelColor(channel, channelValue) {
			return toCssColor(withColorChannel(currentColor, channel, channelValue));
		},
		setChannel,
		stepChannel,
		setColor,
		setText,
		commit
	};

	setColorPickerContext(pickerContext);
	context = pickerContext;

	const defaultLabel = $derived(resolveLocalizedString(resolvedLocale, 'colorPicker.label'));
	const labelledBy = $derived(ariaLabelledBy ?? labelId ?? undefined);
	const inlineStyle = $derived(
		`--color-picker-value: ${cssColor}; --color-picker-hue: ${Math.round(currentColor.h)};` +
			` --color-picker-hue-color: ${hueColor}; --color-picker-alpha: ${currentColor.a};` +
			`${style ? ` ${style}` : ''}`
	);
</script>

<div
	{...restProps}
	bind:this={rootRef}
	id={rootId}
	role="group"
	aria-labelledby={labelledBy}
	aria-label={labelledBy ? undefined : (ariaLabel ?? defaultLabel)}
	aria-describedby={ariaDescribedBy}
	aria-disabled={disabled || undefined}
	class={className}
	style={inlineStyle}
	data-color-picker-root="true"
	data-format={format}
	data-alpha={alpha || undefined}
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	data-invalid={invalid || undefined}
>
	{#if name}
		<input
			bind:this={hiddenInputRef}
			type="hidden"
			{name}
			{form}
			value={text}
			data-color-picker-value="true"
		/>
	{/if}
	{@render children?.()}
</div>
