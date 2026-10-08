import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';
import ColorPickerFormTest from './color-picker-form-test.svelte';
import ColorPickerTest from './color-picker-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

function boundValue(): string | null {
	return JSON.parse(byTestId('bound-value').textContent ?? 'null');
}

function areaInput(axis: 'x' | 'y'): HTMLInputElement {
	const element = document.querySelector<HTMLInputElement>(`[data-axis="${axis}"]`);
	if (!element) throw new Error(`No area input for the ${axis} axis`);
	return element;
}

function sliderInput(channel: string): HTMLInputElement {
	const element = document.querySelector<HTMLInputElement>(
		`[data-color-picker-slider-input="true"][data-channel="${channel}"]`
	);
	if (!element) throw new Error(`No slider input for ${channel}`);
	return element;
}

/** Dispatches a pointer event at a fraction of an element. */
async function pointerAt(target: Element, type: string, fractionX: number, fractionY = 0.5) {
	const rect = target.getBoundingClientRect();
	target.dispatchEvent(
		new PointerEvent(type, {
			clientX: rect.left + rect.width * fractionX,
			clientY: rect.top + rect.height * fractionY,
			pointerId: 1,
			button: 0,
			buttons: type === 'pointerup' ? 0 : 1,
			bubbles: true,
			cancelable: true,
			composed: true
		})
	);
	await tick();
}

describe('ColorPicker', () => {
	it('renders a group named by the label, with a slider for each axis of the square', async () => {
		const screen = render(ColorPickerTest, { defaultValue: '#3366cc' });

		const group = screen.getByRole('group', { name: 'Brand color' });
		expect(group.element()).toBe(byTestId('root'));

		expect(areaInput('x').getAttribute('aria-label')).toBe('Saturation');
		expect(areaInput('x').getAttribute('aria-valuetext')).toBe('75%');
		expect(areaInput('y').getAttribute('aria-label')).toBe('Brightness');
		expect(areaInput('y').getAttribute('aria-valuetext')).toBe('80%');
		expect(sliderInput('hue').getAttribute('aria-label')).toBe('Hue');
		expect(sliderInput('hue').getAttribute('aria-valuetext')).toBe('220°');
	});

	it('gives the color, the hue and the alpha to the CSS of the page', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc' });

		const root = byTestId('root');
		expect(root.style.getPropertyValue('--color-picker-value')).toBe('rgba(51, 102, 204, 1)');
		expect(root.style.getPropertyValue('--color-picker-hue')).toBe('220');
		expect(byTestId('area').style.getPropertyValue('--color-picker-area-x')).toBe('75%');
		expect(byTestId('area').style.getPropertyValue('--color-picker-area-y')).toBe('80%');
		expect(byTestId('preview').getAttribute('data-color')).toBe('#3366cc');
	});

	it('moves the saturation and the brightness with a press in the square', async () => {
		const ends: string[] = [];
		render(ColorPickerTest, { defaultValue: '#ff0000', onChangeEnd: (value) => ends.push(value) });

		const area = byTestId('area');
		await pointerAt(area, 'pointerdown', 0.25, 0.5);

		expect(Number(areaInput('x').value)).toBeCloseTo(25, 0);
		expect(Number(areaInput('y').value)).toBeCloseTo(50, 0);
		expect(byTestId('area').getAttribute('data-dragging')).toBe('true');

		await pointerAt(area, 'pointerup', 0.25, 0.5);

		expect(byTestId('area').hasAttribute('data-dragging')).toBe(false);
		expect(ends).toHaveLength(1);
	});

	it('moves the hue with a press on its track', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000' });

		await pointerAt(byTestId('hue-slider'), 'pointerdown', 0.5);

		expect(boundValue()).toBe('#00ffff');
		expect(sliderInput('hue').value).toBe('180');
	});

	it('mirrors the tracks in a right-to-left context', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000', dir: 'rtl' });

		await pointerAt(byTestId('hue-slider'), 'pointerdown', 0.25);

		expect(sliderInput('hue').value).toBe('270');
	});

	it('moves one step with an arrow, and ten with Shift', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc' });

		sliderInput('hue').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(sliderInput('hue').value).toBe('221');

		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
		expect(sliderInput('hue').value).toBe('236');

		await userEvent.keyboard('{Home}');
		expect(sliderInput('hue').value).toBe('0');

		await userEvent.keyboard('{End}');
		expect(sliderInput('hue').value).toBe('360');
	});

	it('takes the hue past the end of the circle back to the start', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000' });

		sliderInput('hue').focus();
		await userEvent.keyboard('{ArrowLeft}');

		expect(sliderInput('hue').value).toBe('359');
	});

	it('moves both axes of the square from either of its two sliders', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc' });

		areaInput('x').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(Number(areaInput('x').value)).toBe(76);

		await userEvent.keyboard('{ArrowUp}');
		expect(Number(areaInput('y').value)).toBe(81);

		expect(areaInput('x').getAttribute('data-axis')).toBe('x');
		expectNoFalseFocusAttributes();
	});

	it('reports one end for a held key, and one for each drag', async () => {
		const ends: string[] = [];
		render(ColorPickerTest, { defaultValue: '#3366cc', onChangeEnd: (value) => ends.push(value) });

		sliderInput('hue').focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');

		expect(ends).toHaveLength(2);
	});

	it('reads the hex field when the focus leaves it, and at Enter', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000' });

		const hex = byTestId<HTMLInputElement>('hex');
		expect(hex.value).toBe('#ff0000');

		await userEvent.fill(hex, '#00ff00');
		await userEvent.keyboard('{Enter}');
		expect(boundValue()).toBe('#00ff00');

		await userEvent.fill(hex, '#0000ff');
		await userEvent.click(byTestId('after'));
		expect(boundValue()).toBe('#0000ff');
	});

	it('takes the hex field back to the color when the text names no color', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000' });

		const hex = byTestId<HTMLInputElement>('hex');
		await userEvent.fill(hex, 'not a color');
		await userEvent.click(byTestId('after'));
		await tick();

		expect(boundValue()).toBe('#ff0000');
		expect(hex.value).toBe('#ff0000');
	});

	it('holds one channel in a number field, with the limits of that channel', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc' });

		const red = byTestId<HTMLInputElement>('red');
		expect(red.value).toBe('51');
		expect(red.getAttribute('max')).toBe('255');
		expect(red.getAttribute('aria-label')).toBe('Red');

		await userEvent.fill(red, '255');

		expect(boundValue()).toBe('#ff66cc');
	});

	it('keeps the hue of a color that goes to black', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc' });

		await userEvent.fill(byTestId<HTMLInputElement>('red'), '0');
		await userEvent.fill(byTestId<HTMLInputElement>('green'), '0');
		// The color is blue here, and the last step takes it to black: the hue of that blue stays,
		// thus the thumb of the hue does not jump back to red.
		const hue = sliderInput('hue').value;
		await userEvent.fill(byTestId<HTMLInputElement>('blue'), '0');

		expect(boundValue()).toBe('#000000');
		expect(sliderInput('hue').value).toBe(hue);
		expect(hue).toBe('240');
	});

	it('holds an alpha when the picker asks for one', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000', alpha: true, format: 'rgb' });

		expect(sliderInput('alpha').getAttribute('aria-label')).toBe('Alpha');

		await pointerAt(byTestId('alpha-slider'), 'pointerdown', 0.5);

		expect(boundValue()).toBe('rgba(255, 0, 0, 0.5)');
	});

	it('names each swatch, and marks the one that is the color', async () => {
		const screen = render(ColorPickerTest, { defaultValue: '#ff0000' });

		const list = screen.getByRole('listbox', { name: 'Color swatches' });
		expect(list.element()).toBe(byTestId('swatches'));
		expect(byTestId('swatch-0').getAttribute('aria-selected')).toBe('true');
		expect(byTestId('swatch-1').getAttribute('aria-selected')).toBe('false');
		expect(byTestId('swatch-1').getAttribute('aria-label')).toBe('#00ff00');
	});

	it('takes the color of a swatch at a press, and at Enter', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000' });

		await userEvent.click(byTestId('swatch-1'));
		expect(boundValue()).toBe('#00ff00');

		byTestId('swatch-1').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(byTestId('swatch-2'));

		await userEvent.keyboard('{Enter}');
		expect(boundValue()).toBe('#0000ff');
	});

	it('holds one swatch in the tab order', async () => {
		render(ColorPickerTest, { defaultValue: '#00ff00' });

		expect(byTestId('swatch-0').tabIndex).toBe(-1);
		expect(byTestId('swatch-1').tabIndex).toBe(0);
	});

	it('hides the eye dropper of a browser that has none', async () => {
		render(ColorPickerTest);

		const button = byTestId('eye-dropper');
		expect(button.hasAttribute('data-unsupported')).toBe('EyeDropper' in window ? false : true);
	});

	it('reports one change for one move of the pointer in the square', async () => {
		const changes: string[] = [];
		render(ColorPickerTest, { defaultValue: '#ff0000', onChange: (value) => changes.push(value) });

		await pointerAt(byTestId('area'), 'pointerdown', 0.5, 0.5);

		// The two axes are one color. Two writes report a color between them that the pointer was
		// never on, and they make a consumer do its work two times for each move.
		expect(changes).toHaveLength(1);
		expect(changes[0]).toBe(boundValue());
	});

	it('answers Home and End on the axis that has the focus', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc' });

		const saturationBefore = areaInput('x').value;
		areaInput('y').focus();
		await userEvent.keyboard('{Home}');

		// Home on the brightness takes the brightness to its lowest, and leaves the saturation.
		expect(areaInput('y').value).toBe('0');
		expect(areaInput('x').value).toBe(saturationBefore);

		areaInput('x').focus();
		await userEvent.keyboard('{End}');
		expect(areaInput('x').value).toBe('100');
	});

	it('reports no end from a hex field that holds a text of no color', async () => {
		const ends: string[] = [];
		render(ColorPickerTest, { defaultValue: '#3366cc', onChangeEnd: (value) => ends.push(value) });

		const hex = byTestId<HTMLInputElement>('hex');
		hex.focus();
		await userEvent.fill(hex, 'not a color');
		byTestId<HTMLButtonElement>('after').focus();
		await tick();

		expect(ends).toEqual([]);
		// The field cannot hold a text that is not the color.
		expect(hex.value).toBe('#3366cc');
		expect(boundValue()).toBe('#3366cc');
	});

	it('reports no end from a number field the reader only passed through', async () => {
		const ends: string[] = [];
		render(ColorPickerTest, { defaultValue: '#3366cc', onChangeEnd: (value) => ends.push(value) });

		byTestId<HTMLInputElement>('red').focus();
		byTestId<HTMLInputElement>('green').focus();
		byTestId<HTMLButtonElement>('after').focus();
		await tick();

		expect(ends).toEqual([]);
	});

	it('changes nothing while disabled, and leaves the controls out of the tab order', async () => {
		const onChange = vi.fn();
		render(ColorPickerTest, { defaultValue: '#ff0000', disabled: true, onChange });

		await pointerAt(byTestId('hue-slider'), 'pointerdown', 0.5);
		expect(boundValue()).toBe('#ff0000');

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(byTestId('after'));
		expect(onChange).not.toHaveBeenCalled();
	});

	it('changes nothing while readonly', async () => {
		render(ColorPickerTest, { defaultValue: '#ff0000', readonly: true });

		await pointerAt(byTestId('hue-slider'), 'pointerdown', 0.5);
		await userEvent.click(byTestId('swatch-1'));

		expect(boundValue()).toBe('#ff0000');
	});

	it('refuses the change in controlled mode until the parent sends the color', async () => {
		const onChange = vi.fn();
		render(ColorPickerTest, { value: '#ff0000', controlledValue: true, onChange });

		await pointerAt(byTestId('hue-slider'), 'pointerdown', 0.5);

		expect(onChange).toHaveBeenCalledWith(
			'#00ffff',
			expect.objectContaining({ reason: 'pointer' })
		);
		expect(byTestId<HTMLInputElement>('hex').value).toBe('#ff0000');
	});

	it('writes the color in the format the root names', async () => {
		render(ColorPickerTest, { defaultValue: '#3366cc', format: 'hsl' });

		expect(boundValue()).toBe('hsl(220, 60%, 50%)');
	});

	it('carries the color in a form, and takes the first color back at a reset', async () => {
		render(ColorPickerFormTest, { defaultValue: '#ff0000' });

		const hidden = () =>
			byTestId<HTMLFormElement>('form').elements.namedItem('brand') as HTMLInputElement;
		expect(hidden().value).toBe('#ff0000');

		await userEvent.fill(byTestId<HTMLInputElement>('hex'), '#00ff00');
		await userEvent.keyboard('{Enter}');
		expect(hidden().value).toBe('#00ff00');

		byTestId<HTMLButtonElement>('reset').click();
		await new Promise((resolve) => queueMicrotask(() => resolve(null)));
		await tick();

		expect(hidden().value).toBe('#ff0000');
	});
});
