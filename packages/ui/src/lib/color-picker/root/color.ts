/**
 * The color math of the picker.
 *
 * The color is held as hue, saturation and brightness, with an alpha. That is the model the
 * square and the hue slider move in: a square of saturation against brightness keeps its shape
 * at each hue, and red-green-blue does not. Each other model is a conversion of this one.
 */

/** The channels a slider or a field can move. */
export type ColorChannel =
	'hue' | 'saturation' | 'brightness' | 'lightness' | 'alpha' | 'red' | 'green' | 'blue';

/** The text format of the value. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';

/** Hue from 0 to 360, saturation and brightness from 0 to 100, alpha from 0 to 1. */
export type Color = {
	h: number;
	s: number;
	b: number;
	a: number;
};

export type ColorChannelRange = {
	min: number;
	max: number;
	step: number;
	/** The step of `PageUp`, `PageDown` and `Shift` with an arrow. */
	largeStep: number;
};

export const COLOR_CHANNEL_RANGES: Record<ColorChannel, ColorChannelRange> = {
	hue: { min: 0, max: 360, step: 1, largeStep: 15 },
	saturation: { min: 0, max: 100, step: 1, largeStep: 10 },
	brightness: { min: 0, max: 100, step: 1, largeStep: 10 },
	lightness: { min: 0, max: 100, step: 1, largeStep: 10 },
	alpha: { min: 0, max: 1, step: 0.01, largeStep: 0.1 },
	red: { min: 0, max: 255, step: 1, largeStep: 16 },
	green: { min: 0, max: 255, step: 1, largeStep: 16 },
	blue: { min: 0, max: 255, step: 1, largeStep: 16 }
};

export const BLACK: Color = { h: 0, s: 0, b: 0, a: 1 };

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function round(value: number, decimals = 0): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

/**
 * The hue is a circle, thus each hue past the end comes back to the start. 360 is the one value
 * that stays: it is the end of the track of a hue slider, and the color there is the color at 0.
 */
export function normalizeHue(hue: number): number {
	if (!Number.isFinite(hue)) return 0;
	if (hue === 360) return 360;
	return ((hue % 360) + 360) % 360;
}

export function clampColor(color: Color): Color {
	return {
		h: normalizeHue(color.h),
		s: clamp(color.s, 0, 100),
		b: clamp(color.b, 0, 100),
		a: clamp(color.a, 0, 1)
	};
}

export function colorsAreEqual(a: Color, b: Color): boolean {
	return (
		round(a.h, 2) === round(b.h, 2) &&
		round(a.s, 2) === round(b.s, 2) &&
		round(a.b, 2) === round(b.b, 2) &&
		round(a.a, 3) === round(b.a, 3)
	);
}

// --- Conversions ------------------------------------------------------------------------------

export type Rgb = { r: number; g: number; b: number };

export function hsbToRgb(color: Color): Rgb {
	const h = (((color.h % 360) + 360) % 360) / 60;
	const s = clamp(color.s, 0, 100) / 100;
	const v = clamp(color.b, 0, 100) / 100;
	const chroma = v * s;
	const second = chroma * (1 - Math.abs((h % 2) - 1));
	const match = v - chroma;

	let rgb: [number, number, number];
	if (h < 1) rgb = [chroma, second, 0];
	else if (h < 2) rgb = [second, chroma, 0];
	else if (h < 3) rgb = [0, chroma, second];
	else if (h < 4) rgb = [0, second, chroma];
	else if (h < 5) rgb = [second, 0, chroma];
	else rgb = [chroma, 0, second];

	return {
		r: Math.round((rgb[0] + match) * 255),
		g: Math.round((rgb[1] + match) * 255),
		b: Math.round((rgb[2] + match) * 255)
	};
}

export function rgbToHsb(rgb: Rgb, alpha = 1): Color {
	const r = clamp(rgb.r, 0, 255) / 255;
	const g = clamp(rgb.g, 0, 255) / 255;
	const b = clamp(rgb.b, 0, 255) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const chroma = max - min;

	let hue = 0;
	if (chroma !== 0) {
		if (max === r) hue = ((g - b) / chroma) % 6;
		else if (max === g) hue = (b - r) / chroma + 2;
		else hue = (r - g) / chroma + 4;
		hue *= 60;
		if (hue < 0) hue += 360;
	}

	return {
		h: hue,
		s: max === 0 ? 0 : (chroma / max) * 100,
		b: max * 100,
		a: clamp(alpha, 0, 1)
	};
}

export type Hsl = { h: number; s: number; l: number };

export function hsbToHsl(color: Color): Hsl {
	const s = clamp(color.s, 0, 100) / 100;
	const v = clamp(color.b, 0, 100) / 100;
	const l = v * (1 - s / 2);
	const saturation = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
	return { h: normalizeHue(color.h), s: saturation * 100, l: l * 100 };
}

export function hslToHsb(hsl: Hsl, alpha = 1): Color {
	const s = clamp(hsl.s, 0, 100) / 100;
	const l = clamp(hsl.l, 0, 100) / 100;
	const v = l + s * Math.min(l, 1 - l);
	return {
		h: normalizeHue(hsl.h),
		s: (v === 0 ? 0 : 2 * (1 - l / v)) * 100,
		b: v * 100,
		a: clamp(alpha, 0, 1)
	};
}

// --- Channels ---------------------------------------------------------------------------------

export function getColorChannel(color: Color, channel: ColorChannel): number {
	switch (channel) {
		case 'hue':
			return color.h;
		case 'saturation':
			return color.s;
		case 'brightness':
			return color.b;
		case 'alpha':
			return color.a;
		case 'lightness':
			return hsbToHsl(color).l;
		case 'red':
			return hsbToRgb(color).r;
		case 'green':
			return hsbToRgb(color).g;
		case 'blue':
			return hsbToRgb(color).b;
	}
}

/**
 * The color with one channel at a new value. A color without a hue, black or a gray, keeps the
 * hue and the saturation it had: they are the position of the thumb in the square, and a thumb
 * that goes back to the corner on each move is a thumb the user cannot aim.
 */
export function withColorChannel(color: Color, channel: ColorChannel, value: number): Color {
	const range = COLOR_CHANNEL_RANGES[channel];
	const next = clamp(value, range.min, range.max);

	switch (channel) {
		case 'hue':
			return { ...color, h: normalizeHue(next) };
		case 'saturation':
			return { ...color, s: next };
		case 'brightness':
			return { ...color, b: next };
		case 'alpha':
			return { ...color, a: next };
		case 'lightness': {
			const hsl = hsbToHsl(color);
			return keepPosition(hslToHsb({ ...hsl, l: next }, color.a), color);
		}
		default: {
			const rgb = hsbToRgb(color);
			const key = channel === 'red' ? 'r' : channel === 'green' ? 'g' : 'b';
			return keepPosition(rgbToHsb({ ...rgb, [key]: next }, color.a), color);
		}
	}
}

/** Keeps the hue, and the saturation, of a color that no longer says what they are. */
function keepPosition(next: Color, previous: Color): Color {
	const color = { ...next };
	if (color.b === 0 || color.s === 0) color.h = previous.h;
	if (color.b === 0) color.s = previous.s;
	return color;
}

// --- Text -------------------------------------------------------------------------------------

const HEX = /^#?([\da-f]{3,8})$/i;
const FUNCTIONAL = /^(rgba?|hsla?|hsba?|hsva?)\(([^)]+)\)$/i;

function parseNumbers(body: string): number[] {
	return body
		.split(/[\s,/]+/)
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => (part.endsWith('%') ? Number(part.slice(0, -1)) : Number(part)));
}

/** Reads a text into a color. It answers null for a text that names no color. */
export function parseColor(text: string): Color | null {
	const value = text.trim();
	if (!value) return null;

	const hex = HEX.exec(value);
	if (hex) {
		const digits = hex[1];
		if (digits.length === 3 || digits.length === 4) {
			const parts = digits.split('').map((digit) => Number.parseInt(digit + digit, 16));
			return rgbToHsb(
				{ r: parts[0], g: parts[1], b: parts[2] },
				parts[3] === undefined ? 1 : parts[3] / 255
			);
		}
		if (digits.length === 6 || digits.length === 8) {
			const parts = (digits.match(/.{2}/g) ?? []).map((pair) => Number.parseInt(pair, 16));
			return rgbToHsb(
				{ r: parts[0], g: parts[1], b: parts[2] },
				parts[3] === undefined ? 1 : parts[3] / 255
			);
		}
		return null;
	}

	const functional = FUNCTIONAL.exec(value);
	if (!functional) return null;
	const name = functional[1].toLowerCase();
	const numbers = parseNumbers(functional[2]);
	if (numbers.length < 3 || numbers.some((number) => Number.isNaN(number))) return null;

	const alpha = numbers[3] === undefined ? 1 : clamp(numbers[3], 0, 1);
	if (name.startsWith('rgb')) {
		return rgbToHsb({ r: numbers[0], g: numbers[1], b: numbers[2] }, alpha);
	}
	if (name.startsWith('hsl')) {
		return hslToHsb({ h: numbers[0], s: numbers[1], l: numbers[2] }, alpha);
	}
	return clampColor({ h: numbers[0], s: numbers[1], b: numbers[2], a: alpha });
}

function toHexPair(value: number): string {
	return Math.round(clamp(value, 0, 255))
		.toString(16)
		.padStart(2, '0');
}

/**
 * The text of a color. With `alpha` off, the text holds only the three color channels: a picker
 * without an alpha slider must not answer a fourth number nobody can change.
 */
export function formatColor(color: Color, format: ColorFormat, alpha = false): string {
	const withAlpha = alpha && color.a < 1;

	if (format === 'hex') {
		const rgb = hsbToRgb(color);
		const base = `#${toHexPair(rgb.r)}${toHexPair(rgb.g)}${toHexPair(rgb.b)}`;
		return withAlpha ? `${base}${toHexPair(color.a * 255)}` : base;
	}

	if (format === 'rgb') {
		const rgb = hsbToRgb(color);
		return withAlpha
			? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(color.a, 2)})`
			: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
	}

	if (format === 'hsl') {
		const hsl = hsbToHsl(color);
		const base = `${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%`;
		return withAlpha ? `hsla(${base}, ${round(color.a, 2)})` : `hsl(${base})`;
	}

	const base = `${round(color.h)}, ${round(color.s)}%, ${round(color.b)}%`;
	return withAlpha ? `hsba(${base}, ${round(color.a, 2)})` : `hsb(${base})`;
}

/** The color as CSS, always with its alpha: it is what the parts paint with. */
export function toCssColor(color: Color): string {
	const rgb = hsbToRgb(color);
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(color.a, 3)})`;
}

/** The text of the hex field: six digits, or eight with an alpha. */
export function toHexText(color: Color, alpha = false): string {
	return formatColor(color, 'hex', alpha);
}

/** The value of one channel, rounded as the field and the screen reader show it. */
export function getRoundedChannel(color: Color, channel: ColorChannel): number {
	const value = getColorChannel(color, channel);
	return channel === 'alpha' ? round(value, 2) : Math.round(value);
}
