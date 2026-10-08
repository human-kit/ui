import { describe, expect, it } from 'vitest';
import {
	colorsAreEqual,
	formatColor,
	getColorChannel,
	getRoundedChannel,
	hsbToHsl,
	hsbToRgb,
	hslToHsb,
	parseColor,
	rgbToHsb,
	toCssColor,
	withColorChannel
} from './color';

describe('color', () => {
	it('reads a hex color of three, four, six and eight digits', () => {
		expect(parseColor('#f00')).toEqual({ h: 0, s: 100, b: 100, a: 1 });
		expect(parseColor('#ff0000')).toEqual({ h: 0, s: 100, b: 100, a: 1 });
		expect(parseColor('#ff000080')?.a).toBeCloseTo(0.5, 1);
		expect(parseColor('#f008')?.a).toBeCloseTo(0.53, 1);
	});

	it('reads rgb, hsl and hsb', () => {
		expect(parseColor('rgb(255, 0, 0)')).toEqual({ h: 0, s: 100, b: 100, a: 1 });
		expect(parseColor('rgba(255, 0, 0, 0.5)')?.a).toBe(0.5);
		expect(parseColor('hsl(120, 100%, 50%)')).toEqual({ h: 120, s: 100, b: 100, a: 1 });
		expect(parseColor('hsb(240, 100%, 100%)')).toEqual({ h: 240, s: 100, b: 100, a: 1 });
	});

	it('answers null for a text that names no color', () => {
		expect(parseColor('')).toBeNull();
		expect(parseColor('not a color')).toBeNull();
		expect(parseColor('#12345')).toBeNull();
		expect(parseColor('rgb(1, 2)')).toBeNull();
	});

	it('writes the color in each format', () => {
		const color = parseColor('#3366cc')!;

		expect(formatColor(color, 'hex')).toBe('#3366cc');
		expect(formatColor(color, 'rgb')).toBe('rgb(51, 102, 204)');
		expect(formatColor(color, 'hsl')).toBe('hsl(220, 60%, 50%)');
		expect(formatColor(color, 'hsb')).toBe('hsb(220, 75%, 80%)');
	});

	it('writes the alpha only when the picker holds one', () => {
		const color = { ...parseColor('#3366cc')!, a: 0.5 };

		expect(formatColor(color, 'hex')).toBe('#3366cc');
		expect(formatColor(color, 'hex', true)).toBe('#3366cc80');
		expect(formatColor(color, 'rgb', true)).toBe('rgba(51, 102, 204, 0.5)');
		expect(toCssColor(color)).toBe('rgba(51, 102, 204, 0.5)');
	});

	it('goes from red-green-blue to hue-saturation-brightness and back', () => {
		for (const hex of ['#000000', '#ffffff', '#3366cc', '#7f4a1e', '#00ff88']) {
			const color = parseColor(hex)!;
			expect(formatColor(rgbToHsb(hsbToRgb(color), color.a), 'hex')).toBe(hex);
		}
	});

	it('goes from brightness to lightness and back', () => {
		const color = parseColor('#3366cc')!;
		const hsl = hsbToHsl(color);

		expect(colorsAreEqual(hslToHsb(hsl, color.a), color)).toBe(true);
	});

	it('reads one channel of the color', () => {
		const color = parseColor('#3366cc')!;

		expect(getRoundedChannel(color, 'red')).toBe(51);
		expect(getRoundedChannel(color, 'green')).toBe(102);
		expect(getRoundedChannel(color, 'blue')).toBe(204);
		expect(getRoundedChannel(color, 'hue')).toBe(220);
		expect(getRoundedChannel(color, 'saturation')).toBe(75);
		expect(getRoundedChannel(color, 'brightness')).toBe(80);
		expect(getRoundedChannel(color, 'lightness')).toBe(50);
		expect(getRoundedChannel(color, 'alpha')).toBe(1);
	});

	it('writes one channel, and keeps the color in its limits', () => {
		const color = parseColor('#3366cc')!;

		expect(formatColor(withColorChannel(color, 'red', 255), 'hex')).toBe('#ff66cc');
		expect(formatColor(withColorChannel(color, 'red', 999), 'hex')).toBe('#ff66cc');
		expect(getColorChannel(withColorChannel(color, 'hue', 10), 'hue')).toBe(10);
		expect(getColorChannel(withColorChannel(color, 'alpha', 0.25), 'alpha')).toBe(0.25);
	});

	it('keeps the hue of a color that goes to black, and of a gray', () => {
		const color = parseColor('#3366cc')!;

		const black = withColorChannel(withColorChannel(color, 'brightness', 0), 'red', 0);
		expect(black.h).toBe(color.h);
		expect(black.s).toBe(color.s);

		const gray = withColorChannel(parseColor('#808080')!, 'red', 128);
		expect(Number.isFinite(gray.h)).toBe(true);
	});
});
