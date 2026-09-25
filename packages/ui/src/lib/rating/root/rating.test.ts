import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import {
	expectFocusVisibleImpliesFocusWithin,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';
import type { RatingChangeDetails } from '../types';
import RatingFormTest from './rating-form-test.svelte';
import RatingTest from './rating-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

function item(index: number): HTMLElement {
	return byTestId(`item-${index}`);
}

function boundValue(): number | null {
	return JSON.parse(byTestId('bound-value').textContent ?? 'null');
}

/** Dispatches a pointer event on an element, and waits for the DOM to catch up. */
async function pointer(target: Element, type: string, clientX?: number) {
	const rect = target.getBoundingClientRect();
	target.dispatchEvent(
		new PointerEvent(type, {
			clientX: clientX ?? rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
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

/** A press on the left part of an item, where a half rating is. */
async function pressHalf(target: Element) {
	const rect = target.getBoundingClientRect();
	await pointer(target, 'pointerdown', rect.left + rect.width * 0.25);
}

describe('Rating', () => {
	it('renders a radio group named by the label, with one radio per item', async () => {
		const screen = render(RatingTest, { defaultValue: 3 });

		const group = screen.getByRole('radiogroup', { name: 'Quality' });
		expect(group.element()).toBe(byTestId('root'));
		expect(byTestId('root').getAttribute('aria-labelledby')).toBe(byTestId('label').id);

		const radios = screen.getByRole('radio').all();
		expect(radios).toHaveLength(5);
		expect(item(2).getAttribute('aria-checked')).toBe('true');
		expect(item(1).getAttribute('aria-checked')).toBe('false');
		expect(item(2).getAttribute('aria-label')).toBe('3 of 5');
		expect(byTestId('output').textContent?.trim()).toBe('3 of 5');
	});

	it('fills each item up to the value, and part of one item at a half rating', async () => {
		render(RatingTest, { defaultValue: 2.5, precision: 0.5 });

		expect(item(1).style.getPropertyValue('--rating-item-fill')).toBe('1');
		expect(item(2).style.getPropertyValue('--rating-item-fill')).toBe('0.5');
		expect(item(3).style.getPropertyValue('--rating-item-fill')).toBe('0');
		expect(item(2).getAttribute('data-partial')).toBe('true');
		expect(item(1).hasAttribute('data-partial')).toBe(false);
	});

	it('writes the value of the item the pointer presses', async () => {
		const changes: Array<[number, RatingChangeDetails]> = [];
		const ends: number[] = [];
		render(RatingTest, {
			onChange: (value, details) => changes.push([value, details]),
			onChangeEnd: (value) => ends.push(value)
		});

		await pointer(item(3), 'pointerdown');

		expect(boundValue()).toBe(4);
		expect(changes).toHaveLength(1);
		expect(changes[0][0]).toBe(4);
		expect(changes[0][1].reason).toBe('pointer');
		expect(ends).toEqual([4]);
	});

	it('takes the half the pointer is on at a precision of 0.5', async () => {
		render(RatingTest, { precision: 0.5 });

		await pressHalf(item(2));

		expect(boundValue()).toBe(2.5);
	});

	it('puts the value back to 0 on a press on the value, and reports the reason', async () => {
		const reasons: string[] = [];
		render(RatingTest, {
			defaultValue: 4,
			onChange: (_value, details) => reasons.push(details.reason)
		});

		await pointer(item(3), 'pointerdown');

		expect(boundValue()).toBe(0);
		expect(reasons).toEqual(['clear']);
	});

	it('keeps the value on a press on the value when allowClear is off', async () => {
		render(RatingTest, { defaultValue: 4, allowClear: false });

		await pointer(item(3), 'pointerdown');

		expect(boundValue()).toBe(4);
	});

	it('shows the value under the pointer, and the value again when the pointer leaves', async () => {
		render(RatingTest, { defaultValue: 1 });

		await pointer(item(3), 'pointerenter');

		expect(byTestId('output').textContent?.trim()).toBe('4 of 5');
		expect(byTestId('root').getAttribute('data-hovering')).toBe('true');
		expect(item(2).getAttribute('data-highlighted')).toBe('true');
		expect(boundValue()).toBe(1);

		await pointer(byTestId('root'), 'pointerleave');

		expect(byTestId('output').textContent?.trim()).toBe('1 of 5');
		expect(byTestId('root').hasAttribute('data-hovering')).toBe(false);
	});

	it('leaves no preview after a press with a finger', async () => {
		render(RatingTest, { defaultValue: 1 });

		const target = item(3);
		const rect = target.getBoundingClientRect();
		for (const type of ['pointerenter', 'pointerdown', 'pointerup']) {
			target.dispatchEvent(
				new PointerEvent(type, {
					clientX: rect.left + rect.width / 2,
					clientY: rect.top + rect.height / 2,
					pointerId: 7,
					pointerType: 'touch',
					button: 0,
					buttons: type === 'pointerup' ? 0 : 1,
					bubbles: true,
					cancelable: true,
					composed: true
				})
			);
			await tick();
		}

		// A finger cannot rest on an item, and the leave that ends a preview does not come from
		// each browser: a preview that stays on is a preview that never goes.
		expect(boundValue()).toBe(4);
		expect(byTestId('root').hasAttribute('data-hovering')).toBe(false);
		expect(byTestId('output').textContent?.trim()).toBe('4 of 5');
	});

	it('moves the value with the arrows, and carries the focus with it', async () => {
		render(RatingTest, { defaultValue: 2 });

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(item(1));

		await userEvent.keyboard('{ArrowRight}');
		expect(boundValue()).toBe(3);
		expect(document.activeElement).toBe(item(2));
		expect(item(2).getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(boundValue()).toBe(1);
		expect(document.activeElement).toBe(item(0));

		expectFocusVisibleImpliesFocusWithin(byTestId('root'));
		expectNoFalseFocusAttributes();
	});

	it('mirrors the arrows in a right-to-left context', async () => {
		render(RatingTest, { defaultValue: 2, dir: 'rtl' });

		await userEvent.keyboard('{Tab}{Tab}');
		await userEvent.keyboard('{ArrowLeft}');

		expect(boundValue()).toBe(3);
	});

	it('goes to the first item with Home, to the last with End, and to 0 with Delete', async () => {
		render(RatingTest, { defaultValue: 3 });

		await userEvent.keyboard('{Tab}{Tab}');
		await userEvent.keyboard('{End}');
		expect(boundValue()).toBe(5);

		await userEvent.keyboard('{Home}');
		expect(boundValue()).toBe(1);

		await userEvent.keyboard('{Delete}');
		expect(boundValue()).toBe(0);
	});

	it('reports one end for a held key, and one for each press', async () => {
		const ends: number[] = [];
		render(RatingTest, { defaultValue: 1, onChangeEnd: (value) => ends.push(value) });

		await userEvent.keyboard('{Tab}{Tab}');
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{ArrowRight}');

		expect(ends).toEqual([2, 3]);
	});

	it('answers Space on the item that has the focus', async () => {
		render(RatingTest);

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(item(0));

		await userEvent.keyboard(' ');

		expect(boundValue()).toBe(1);
	});

	it('is a slider at a precision below 1, with one tab stop and the text of the value', async () => {
		const screen = render(RatingTest, { defaultValue: 2.5, precision: 0.5 });

		const slider = screen.getByRole('slider', { name: 'Quality' });
		expect(slider.element()).toBe(byTestId('root'));
		expect(byTestId('root').getAttribute('aria-valuenow')).toBe('2.5');
		expect(byTestId('root').getAttribute('aria-valuetext')).toBe('2.5 of 5');
		expect(byTestId('root').getAttribute('aria-valuemax')).toBe('5');
		expect(screen.getByRole('radio').all()).toHaveLength(0);

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(byTestId('root'));

		await userEvent.keyboard('{ArrowRight}');
		expect(boundValue()).toBe(3);
		expect(byTestId('root').getAttribute('aria-valuenow')).toBe('3');
	});

	it('takes the focus at a press, thus the arrows answer without a Tab first', async () => {
		render(RatingTest, { defaultValue: 3.5, precision: 0.5 });

		// A slider has one tab stop, and it is the root. Without the focus the arrows go to the
		// body, and the rating answers nothing until the reader presses Tab.
		// The centre of an item is the border of its two halves, thus this press gives the half.
		await pointer(item(2), 'pointerdown');

		expect(document.activeElement).toBe(byTestId('root'));
		expect(boundValue()).toBe(2.5);

		await userEvent.keyboard('{ArrowRight}');
		expect(boundValue()).toBe(3);
		// A press shows no focus ring.
		expectNoFalseFocusAttributes();
	});

	it('says that a radio group is read only', async () => {
		render(RatingTest, { defaultValue: 2, readonly: true });

		expect(byTestId('root').getAttribute('role')).toBe('radiogroup');
		expect(byTestId('root').getAttribute('aria-readonly')).toBe('true');
	});

	it('says no rating at 0', async () => {
		render(RatingTest, { defaultValue: 0, precision: 0.5 });

		expect(byTestId('output').textContent?.trim()).toBe('No rating');
		expect(byTestId('root').getAttribute('aria-valuetext')).toBe('No rating');
	});

	it('takes the text of the value and of each item from the consumer', async () => {
		render(RatingTest, {
			defaultValue: 2,
			getValueText: (value, count) => `${value}/${count} stars`,
			getItemLabel: (value) => `${value} stars`
		});

		expect(byTestId('output').textContent?.trim()).toBe('2/5 stars');
		expect(item(1).getAttribute('aria-label')).toBe('2 stars');
	});

	it('changes nothing while disabled, and leaves the items out of the tab order', async () => {
		const onChange = vi.fn();
		render(RatingTest, { defaultValue: 2, disabled: true, onChange });

		await pointer(item(4), 'pointerdown');
		expect(boundValue()).toBe(2);

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(byTestId('after'));
		expect(onChange).not.toHaveBeenCalled();
		expect(byTestId('root').getAttribute('data-disabled')).toBe('true');
		expect(byTestId('root').getAttribute('aria-disabled')).toBe('true');
	});

	it('keeps the items in the tab order while readonly, and changes nothing', async () => {
		render(RatingTest, { defaultValue: 2, readonly: true });

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(item(1));

		await userEvent.keyboard('{ArrowRight}');
		expect(boundValue()).toBe(2);

		await pointer(item(4), 'pointerenter');
		expect(byTestId('root').hasAttribute('data-hovering')).toBe(false);
	});

	it('refuses the change in controlled mode until the parent sends the value', async () => {
		const onChange = vi.fn();
		render(RatingTest, { value: 2, controlledValue: true, onChange });

		await pointer(item(3), 'pointerdown');

		expect(onChange).toHaveBeenCalledWith(4, expect.objectContaining({ reason: 'pointer' }));
		expect(item(1).getAttribute('aria-checked')).toBe('true');
		expect(item(3).getAttribute('aria-checked')).toBe('false');
	});

	it('marks the rating as necessary and as invalid', async () => {
		render(RatingTest, { required: true, invalid: true });

		expect(byTestId('root').getAttribute('aria-required')).toBe('true');
		expect(byTestId('root').getAttribute('aria-invalid')).toBe('true');
		expect(byTestId('root').getAttribute('data-invalid')).toBe('true');
	});

	it('carries the value in a form, and takes the first value back at a reset', async () => {
		render(RatingFormTest, { defaultValue: 2 });

		const hidden = () => byTestId<HTMLFormElement>('form').elements.namedItem('quality');
		expect((hidden() as HTMLInputElement).value).toBe('2');

		await pointer(item(4), 'pointerdown');
		expect((hidden() as HTMLInputElement).value).toBe('5');

		byTestId<HTMLButtonElement>('reset').click();
		await new Promise((resolve) => queueMicrotask(() => resolve(null)));
		await tick();

		expect((hidden() as HTMLInputElement).value).toBe('2');
	});
});
