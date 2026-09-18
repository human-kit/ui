import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import {
	expectFocusVisibleImpliesFocusWithin,
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';
import type { SliderChangeDetails, SliderValue } from '../types';
import SliderFormTest from './slider-form-test.svelte';
import SliderTest from './slider-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

function input(index = 0): HTMLInputElement {
	const element = document.querySelector<HTMLInputElement>(
		`[data-slider-input="true"][data-index="${index}"]`
	);
	if (!element) throw new Error(`No slider input at index ${index}`);
	return element;
}

function boundValue(): SliderValue {
	return JSON.parse(byTestId('bound-value').textContent ?? 'null');
}

type PointerInit = { clientX: number; clientY: number };

/** Dispatches a pointer event, and waits for the DOM to catch up with the state. */
async function pointer(target: Element, type: string, init: PointerInit, pointerId = 1) {
	target.dispatchEvent(
		new PointerEvent(type, {
			...init,
			pointerId,
			button: 0,
			buttons: type === 'pointerup' ? 0 : 1,
			bubbles: true,
			cancelable: true,
			composed: true
		})
	);
	await tick();
}

/** The pointer position at a fraction of the track, from its start edge. */
function at(
	track: HTMLElement,
	fraction: number,
	orientation: 'horizontal' | 'vertical' = 'horizontal'
): PointerInit {
	const rect = track.getBoundingClientRect();
	if (orientation === 'vertical') {
		return { clientX: rect.left + rect.width / 2, clientY: rect.bottom - rect.height * fraction };
	}
	return { clientX: rect.left + rect.width * fraction, clientY: rect.top + rect.height / 2 };
}

describe('Slider', () => {
	it('renders a group named by the label, and a native slider in the thumb', async () => {
		const screen = render(SliderTest, { defaultValue: 25 });

		const group = screen.getByRole('group', { name: 'Volume' });
		expect(group.element()).toBe(byTestId('root'));
		expect(byTestId('root').getAttribute('aria-labelledby')).toBe(byTestId('label').id);

		const slider = screen.getByRole('slider', { name: 'Volume' });
		expect(slider.element()).toBe(input());
		expect(input().type).toBe('range');
		expect(input().value).toBe('25');
		expect(input().getAttribute('aria-valuenow')).toBe('25');
		expect(input().getAttribute('aria-valuetext')).toBe('25');
		expect(input().getAttribute('min')).toBe('0');
		expect(input().getAttribute('max')).toBe('100');
		expect(input().getAttribute('aria-orientation')).toBe('horizontal');
		expect(byTestId('output').getAttribute('for')).toBe(input().id);
		expect(byTestId('output').getAttribute('aria-live')).toBe('off');
		expect(byTestId('output').textContent).toBe('25');
	});

	it('names the slider from an aria-label on the root when there is no label', async () => {
		const screen = render(SliderTest, { withLabel: false, ariaLabel: 'Brightness' });

		expect(screen.getByRole('group', { name: 'Brightness' }).element()).toBe(byTestId('root'));
		expect(screen.getByRole('slider', { name: 'Brightness' }).element()).toBe(input());
		expect(input().hasAttribute('aria-labelledby')).toBe(false);
	});

	it('starts at min, and writes the default back to bind:value', async () => {
		render(SliderTest, { min: 10 });

		expect(input().value).toBe('10');
		await expect.poll(() => boundValue()).toBe(10);
	});

	it('positions the thumb and the fill in percent of the value', async () => {
		render(SliderTest, { defaultValue: 25 });

		expect(byTestId('thumb-0').style.left).toBe('25%');
		expect(byTestId('fill').style.width).toBe('25%');
		expect(byTestId('fill').style.insetInlineStart).toBe('0%');
	});

	describe('keyboard', () => {
		it('steps with the arrows, pages with PageUp and PageDown, and jumps with Home and End', async () => {
			const changes: Array<[SliderValue, string]> = [];
			const ends: SliderValue[] = [];
			render(SliderTest, {
				defaultValue: 50,
				onChange: (value, details) => changes.push([value, details.reason]),
				onChangeEnd: (value) => ends.push(value)
			});

			input().focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(input().value).toBe('51');
			await userEvent.keyboard('{ArrowUp}');
			expect(input().value).toBe('52');
			await userEvent.keyboard('{ArrowLeft}');
			expect(input().value).toBe('51');
			await userEvent.keyboard('{ArrowDown}');
			expect(input().value).toBe('50');
			await userEvent.keyboard('{PageUp}');
			expect(input().value).toBe('60');
			await userEvent.keyboard('{PageDown}');
			expect(input().value).toBe('50');
			await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
			expect(input().value).toBe('60');
			await userEvent.keyboard('{Home}');
			expect(input().value).toBe('0');
			await userEvent.keyboard('{End}');
			expect(input().value).toBe('100');

			expect(changes.map(([value]) => value)).toEqual([51, 52, 51, 50, 60, 50, 60, 0, 100]);
			expect(changes.every(([, reason]) => reason === 'keyboard')).toBe(true);
			expect(ends).toEqual([51, 52, 51, 50, 60, 50, 60, 0, 100]);
			await expect.poll(() => boundValue()).toBe(100);
		});

		it('stops at the ends, and reports nothing there', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, { defaultValue: 100, onChange: (value) => changes.push(value) });

			input().focus();
			await userEvent.keyboard('{ArrowRight}{PageUp}{End}');

			expect(input().value).toBe('100');
			expect(changes).toEqual([]);
		});

		it('uses the step, and a largeStep of its own', async () => {
			render(SliderTest, { defaultValue: 0, step: 5, largeStep: 25 });

			input().focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(input().value).toBe('5');
			await userEvent.keyboard('{PageUp}');
			expect(input().value).toBe('30');
		});

		it('keeps a decimal step exact', async () => {
			render(SliderTest, { defaultValue: 0.1, min: 0, max: 1, step: 0.1 });

			input().focus();
			await userEvent.keyboard('{ArrowRight}{ArrowRight}');

			expect(input().value).toBe('0.3');
			await expect.poll(() => boundValue()).toBe(0.3);
		});

		it('flips ArrowLeft and ArrowRight in a right-to-left context', async () => {
			render(SliderTest, { defaultValue: 50, dir: 'rtl' });

			input().focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(input().value).toBe('49');
			await userEvent.keyboard('{ArrowLeft}');
			expect(input().value).toBe('50');
			// ArrowUp and Home do not depend on the direction.
			await userEvent.keyboard('{ArrowUp}');
			expect(input().value).toBe('51');
		});

		it('reads ArrowUp as more on a vertical track too', async () => {
			render(SliderTest, { defaultValue: 50, orientation: 'vertical' });

			expect(input().getAttribute('aria-orientation')).toBe('vertical');
			input().focus();
			await userEvent.keyboard('{ArrowUp}');
			expect(input().value).toBe('51');
			await userEvent.keyboard('{ArrowRight}');
			expect(input().value).toBe('52');
			await userEvent.keyboard('{ArrowDown}');
			expect(input().value).toBe('51');
		});

		it('leaves a key with a modifier to the browser', async () => {
			render(SliderTest, { defaultValue: 50 });

			input().focus();
			const event = new KeyboardEvent('keydown', {
				key: 'ArrowRight',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			});
			input().dispatchEvent(event);

			expect(event.defaultPrevented).toBe(false);
			expect(input().value).toBe('50');
		});
	});

	describe('pointer', () => {
		it('moves the thumb to a press on the track, and focuses it without a focus ring', async () => {
			const changes: Array<[SliderValue, SliderChangeDetails['reason']]> = [];
			const ends: SliderValue[] = [];
			render(SliderTest, {
				defaultValue: 25,
				onChange: (value, details) => changes.push([value, details.reason]),
				onChangeEnd: (value) => ends.push(value)
			});
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.75));

			expect(input().value).toBe('75');
			expect(document.activeElement).toBe(input());
			expect(byTestId('thumb-0').getAttribute('data-focused')).toBe('true');
			expect(byTestId('thumb-0').hasAttribute('data-focus-visible')).toBe(false);
			expect(byTestId('root').getAttribute('data-dragging')).toBe('true');
			expect(track.getAttribute('data-dragging')).toBe('true');
			expect(byTestId('thumb-0').getAttribute('data-dragging')).toBe('true');
			expect(ends).toEqual([]);

			await pointer(track, 'pointermove', at(track, 0.5));
			expect(input().value).toBe('50');

			await pointer(track, 'pointerup', at(track, 0.5));
			expect(byTestId('root').hasAttribute('data-dragging')).toBe(false);
			expect(byTestId('thumb-0').hasAttribute('data-dragging')).toBe(false);
			expect(changes).toEqual([
				[75, 'pointer'],
				[50, 'pointer']
			]);
			expect(ends).toEqual([50]);
			expectNoFalseFocusAttributes();
		});

		it('keeps the value on a press on the thumb, and moves it with the drag', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, { defaultValue: 25, onChange: (value) => changes.push(value) });
			const track = byTestId('track');
			const thumb = byTestId('thumb-0');
			const thumbRect = thumb.getBoundingClientRect();

			// A press off the center of the thumb, which a press on the track would read as 27.
			await pointer(thumb, 'pointerdown', {
				clientX: thumbRect.left + thumbRect.width - 1,
				clientY: thumbRect.top + thumbRect.height / 2
			});
			expect(input().value).toBe('25');
			expect(changes).toEqual([]);
			expect(thumb.getAttribute('data-dragging')).toBe('true');

			await pointer(thumb, 'pointermove', at(track, 0.6));
			expect(input().value).toBe('60');
			await pointer(thumb, 'pointerup', at(track, 0.6));
			expect(changes).toEqual([60]);
		});

		it('ignores a press with a button that is not the main one', async () => {
			render(SliderTest, { defaultValue: 25 });
			const track = byTestId('track');

			track.dispatchEvent(
				new PointerEvent('pointerdown', {
					...at(track, 0.75),
					pointerId: 1,
					button: 2,
					buttons: 2,
					bubbles: true
				})
			);
			await tick();

			expect(input().value).toBe('25');
			expect(byTestId('root').hasAttribute('data-dragging')).toBe(false);
		});

		it('reads the start edge as max in a right-to-left context', async () => {
			render(SliderTest, { defaultValue: 50, dir: 'rtl' });
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.25));
			await pointer(track, 'pointerup', at(track, 0.25));

			expect(input().value).toBe('75');
			expect(byTestId('thumb-0').style.left).toBe('25%');
		});

		it('reads the bottom edge as min on a vertical track', async () => {
			render(SliderTest, { defaultValue: 50, orientation: 'vertical' });
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.25, 'vertical'));
			await pointer(track, 'pointerup', at(track, 0.25, 'vertical'));

			expect(input().value).toBe('25');
			expect(byTestId('thumb-0').style.bottom).toBe('25%');
			expect(byTestId('fill').style.height).toBe('25%');
		});

		it('snaps a press to the step', async () => {
			render(SliderTest, { defaultValue: 0, step: 10 });
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.44));
			await pointer(track, 'pointerup', at(track, 0.44));

			expect(input().value).toBe('40');
		});
	});

	describe('range', () => {
		it('renders one slider per value, named by its end and by the label', async () => {
			const screen = render(SliderTest, { defaultValue: [25, 45] });

			expect(screen.getByRole('slider', { name: 'Minimum Volume' }).element()).toBe(input(0));
			expect(screen.getByRole('slider', { name: 'Maximum Volume' }).element()).toBe(input(1));
			expect(input(0).getAttribute('aria-labelledby')).toBe(
				`${input(0).id} ${byTestId('label').id}`
			);
			expect(byTestId('output').getAttribute('for')).toBe(`${input(0).id} ${input(1).id}`);
			expect(byTestId('output').textContent).toBe('25–45');
			expect(byTestId('fill').style.insetInlineStart).toBe('25%');
			expect(byTestId('fill').style.width).toBe('20%');
			expect(byTestId('thumb-1').getAttribute('data-index')).toBe('1');
		});

		it('takes the names the thumbs give', async () => {
			const screen = render(SliderTest, { defaultValue: [25, 45], thumbLabels: ['Low', 'High'] });

			expect(screen.getByRole('slider', { name: 'Low Volume' }).element()).toBe(input(0));
			expect(screen.getByRole('slider', { name: 'High Volume' }).element()).toBe(input(1));
		});

		it('does not let a thumb pass its neighbor', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, { defaultValue: [40, 42], onChange: (value) => changes.push(value) });

			input(0).focus();
			await userEvent.keyboard('{End}');
			expect(input(0).value).toBe('42');
			await userEvent.keyboard('{ArrowRight}');
			expect(input(0).value).toBe('42');

			input(1).focus();
			await userEvent.keyboard('{Home}');
			expect(input(1).value).toBe('42');

			expect(changes).toEqual([[42, 42]]);
			await expect.poll(() => boundValue()).toEqual([42, 42]);
		});

		it('keeps minStepsBetweenThumbs between the thumbs', async () => {
			render(SliderTest, { defaultValue: [40, 50], step: 5, minStepsBetweenThumbs: 2 });

			input(0).focus();
			await userEvent.keyboard('{End}');
			expect(input(0).value).toBe('40');

			input(1).focus();
			await userEvent.keyboard('{ArrowUp}');
			expect(input(1).value).toBe('55');
			input(0).focus();
			await userEvent.keyboard('{ArrowUp}');
			expect(input(0).value).toBe('45');
		});

		it('moves the nearest thumb on a press on the track', async () => {
			render(SliderTest, { defaultValue: [20, 80] });
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.6));
			await pointer(track, 'pointerup', at(track, 0.6));
			expect(input(0).value).toBe('20');
			expect(input(1).value).toBe('60');
			expect(document.activeElement).toBe(input(1));

			await pointer(track, 'pointerdown', at(track, 0.3));
			await pointer(track, 'pointerup', at(track, 0.3));
			expect(input(0).value).toBe('30');
			expect(input(1).value).toBe('60');
		});

		it('separates two stacked thumbs with a press to either side', async () => {
			render(SliderTest, { defaultValue: [50, 50] });
			const track = byTestId('track');

			// The press to the right takes the upper thumb.
			await pointer(track, 'pointerdown', at(track, 0.7));
			await pointer(track, 'pointerup', at(track, 0.7));
			expect([input(0).value, input(1).value]).toEqual(['50', '70']);

			// The press to the left of the pair takes the lower one.
			await pointer(track, 'pointerdown', at(track, 0.3));
			await pointer(track, 'pointerup', at(track, 0.3));
			expect([input(0).value, input(1).value]).toEqual(['30', '70']);
		});

		it('takes the lower thumb for a press to the left of two stacked thumbs', async () => {
			render(SliderTest, { defaultValue: [50, 50] });
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.3));
			await pointer(track, 'pointerup', at(track, 0.3));

			expect([input(0).value, input(1).value]).toEqual(['30', '50']);
		});

		it('reports an array with one element for a range of one', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, { defaultValue: [25], onChange: (value) => changes.push(value) });

			expect(input(0).hasAttribute('aria-label')).toBe(false);
			input(0).focus();
			await userEvent.keyboard('{ArrowRight}');

			expect(changes).toEqual([[26]]);
		});
	});

	describe('states', () => {
		it('disables the native inputs and reports no change', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, {
				defaultValue: 25,
				disabled: true,
				onChange: (value) => changes.push(value)
			});
			const track = byTestId('track');

			expect(input().disabled).toBe(true);
			expect(byTestId('root').getAttribute('data-disabled')).toBe('true');
			expect(byTestId('thumb-0').getAttribute('data-disabled')).toBe('true');
			expect(byTestId('track').getAttribute('data-disabled')).toBe('true');

			await pointer(track, 'pointerdown', at(track, 0.75));
			await pointer(track, 'pointerup', at(track, 0.75));
			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');

			expect(document.activeElement).toBe(byTestId('after'));
			expect(input().value).toBe('25');
			expect(changes).toEqual([]);
		});

		it('keeps a readonly thumb in the tab order, but refuses each change', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, {
				defaultValue: 25,
				readonly: true,
				onChange: (value) => changes.push(value)
			});
			const track = byTestId('track');

			expect(input().getAttribute('aria-readonly')).toBe('true');
			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');
			expect(document.activeElement).toBe(input());
			await userEvent.keyboard('{ArrowRight}{End}');
			await pointer(track, 'pointerdown', at(track, 0.75));
			await pointer(track, 'pointerup', at(track, 0.75));

			expect(input().value).toBe('25');
			expect(changes).toEqual([]);
			expect(byTestId('root').hasAttribute('data-dragging')).toBe(false);
		});

		it('marks an invalid value on the input and the parts', async () => {
			render(SliderTest, { defaultValue: 25, invalid: true });

			expect(input().getAttribute('aria-invalid')).toBe('true');
			expect(byTestId('root').getAttribute('data-invalid')).toBe('true');
			expect(byTestId('thumb-0').getAttribute('data-invalid')).toBe('true');
		});
	});

	describe('value', () => {
		it('follows a value the parent sends down', async () => {
			const screen = render(SliderTest, { value: 25 });

			await screen.rerender({ value: 60 });

			expect(input().value).toBe('60');
			expect(byTestId('thumb-0').style.left).toBe('60%');
		});

		it('lets a controlled parent refuse a change', async () => {
			const changes: SliderValue[] = [];
			render(SliderTest, {
				value: 25,
				controlledValue: true,
				onChange: (value) => changes.push(value)
			});

			input().focus();
			await userEvent.keyboard('{ArrowRight}');

			expect(changes).toEqual([26]);
			expect(input().value).toBe('25');
			expect(input().getAttribute('aria-valuenow')).toBe('25');
			expect(byTestId('thumb-0').style.left).toBe('25%');
		});

		it('takes a change that assistive technology writes to the native input', async () => {
			const changes: Array<[SliderValue, SliderChangeDetails['reason']]> = [];
			const ends: SliderValue[] = [];
			render(SliderTest, {
				defaultValue: 25,
				step: 5,
				onChange: (value, details) => changes.push([value, details.reason]),
				onChangeEnd: (value) => ends.push(value)
			});

			input().value = '40';
			input().dispatchEvent(new Event('input', { bubbles: true }));

			expect(changes).toEqual([[40, 'input']]);
			expect(ends).toEqual([40]);
			await expect.poll(() => boundValue()).toBe(40);
		});

		it('formats the text with formatOptions, and reads a text of its own', async () => {
			render(SliderTest, {
				defaultValue: 0.25,
				min: 0,
				max: 1,
				step: 0.05,
				formatOptions: { style: 'percent' }
			});

			expect(byTestId('output').textContent).toBe('25%');
			expect(input().getAttribute('aria-valuetext')).toBe('25%');
			expect(input().getAttribute('aria-valuenow')).toBe('0.25');
		});

		it('reads the text that getValueText gives', async () => {
			render(SliderTest, {
				defaultValue: [1, 3],
				min: 0,
				max: 5,
				getValueText: (value, index) => `${value} stars, thumb ${index}`
			});

			expect(input(0).getAttribute('aria-valuetext')).toBe('1 stars, thumb 0');
			expect(input(1).getAttribute('aria-valuetext')).toBe('3 stars, thumb 1');
		});
	});

	describe('form', () => {
		it('sends the value with the name, one entry per thumb', async () => {
			render(SliderFormTest, { defaultValue: [20, 80] });
			const form = document.querySelector('form') as HTMLFormElement;

			const data = new FormData(form);
			expect(data.getAll('price')).toEqual(['20', '80']);
		});

		it('sends the names the thumbs give', async () => {
			render(SliderFormTest, { defaultValue: [20, 80], thumbNames: ['low', 'high'] });
			const form = document.querySelector('form') as HTMLFormElement;

			const data = new FormData(form);
			expect(data.get('low')).toBe('20');
			expect(data.get('high')).toBe('80');
			expect(data.has('price')).toBe(false);
		});

		it('returns to the default on a form reset', async () => {
			const changes: Array<[SliderValue, SliderChangeDetails['reason']]> = [];
			render(SliderFormTest, {
				defaultValue: 30,
				onChange: (value, details) => changes.push([value, details.reason])
			});
			const form = document.querySelector('form') as HTMLFormElement;

			input().focus();
			await userEvent.keyboard('{ArrowRight}');
			form.reset();

			await expect.poll(() => input().value).toBe('30');
			expect(changes).toEqual([
				[31, 'keyboard'],
				[30, 'form-reset']
			]);
		});
	});

	describe('focus', () => {
		it('shows the keyboard focus on the thumb and on the root', async () => {
			render(SliderTest, { defaultValue: 25 });

			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');

			expect(document.activeElement).toBe(input());
			expect(byTestId('thumb-0').getAttribute('data-focused')).toBe('true');
			expect(byTestId('thumb-0').getAttribute('data-focus-visible')).toBe('true');
			expect(byTestId('root').getAttribute('data-focus-within')).toBe('true');
			expect(byTestId('root').getAttribute('data-focus-visible')).toBe('true');
			expectFocusVisibleImpliesFocused(byTestId('thumb-0'));
			expectFocusVisibleImpliesFocusWithin(byTestId('root'));

			await userEvent.keyboard('{Tab}');
			expect(document.activeElement).toBe(byTestId('after'));
			expect(byTestId('thumb-0').hasAttribute('data-focused')).toBe(false);
			expect(byTestId('thumb-0').hasAttribute('data-focus-visible')).toBe(false);
			expect(byTestId('root').hasAttribute('data-focus-within')).toBe(false);
			expect(byTestId('root').hasAttribute('data-focus-visible')).toBe(false);
			expectNoFalseFocusAttributes();
		});

		it('shows the focus ring after a key press that follows a pointer press', async () => {
			render(SliderTest, { defaultValue: 25 });
			const track = byTestId('track');

			await pointer(track, 'pointerdown', at(track, 0.5));
			await pointer(track, 'pointerup', at(track, 0.5));
			expect(byTestId('thumb-0').getAttribute('data-focused')).toBe('true');
			expect(byTestId('thumb-0').hasAttribute('data-focus-visible')).toBe(false);

			await userEvent.keyboard('{ArrowRight}');
			expect(input().value).toBe('51');
			expect(byTestId('thumb-0').getAttribute('data-focus-visible')).toBe('true');
			expect(byTestId('root').getAttribute('data-focus-visible')).toBe('true');
		});

		it('puts the focus on the first thumb from a press on the label', async () => {
			render(SliderTest, { defaultValue: [25, 45] });

			byTestId('label').click();

			expect(document.activeElement).toBe(input(0));
		});

		it('tabs through the thumbs of a range in order', async () => {
			render(SliderTest, { defaultValue: [25, 45] });

			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');
			expect(document.activeElement).toBe(input(0));
			await userEvent.keyboard('{Tab}');
			expect(document.activeElement).toBe(input(1));
			expect(byTestId('thumb-0').hasAttribute('data-focused')).toBe(false);
			expect(byTestId('thumb-1').getAttribute('data-focused')).toBe('true');
		});
	});
});
