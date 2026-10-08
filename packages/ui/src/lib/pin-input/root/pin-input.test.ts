import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';
import PinInputFormTest from './pin-input-form-test.svelte';
import PinInputTest from './pin-input-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

function cell(index: number): HTMLInputElement {
	return byTestId<HTMLInputElement>(`cell-${index}`);
}

function boundValue(): string | null {
	return JSON.parse(byTestId('bound-value').textContent ?? 'null');
}

/** Pastes text into the cell that has the focus. */
async function paste(target: HTMLElement, text: string) {
	const data = new DataTransfer();
	data.setData('text', text);
	target.dispatchEvent(
		new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true })
	);
	await tick();
}

describe('PinInput', () => {
	it('renders a group named by the label, with one input per cell', async () => {
		const screen = render(PinInputTest, { defaultValue: '12' });

		const group = screen.getByRole('group', { name: 'Code' });
		expect(group.element()).toBe(byTestId('root'));

		expect(cell(0).value).toBe('1');
		expect(cell(1).value).toBe('2');
		expect(cell(2).value).toBe('');
		expect(cell(0).getAttribute('aria-label')).toBe('Digit 1 of 4');
		expect(cell(0).inputMode).toBe('numeric');
		expect(cell(0).type).toBe('text');
		expect(cell(1).getAttribute('data-filled')).toBe('true');
		expect(cell(2).getAttribute('data-active')).toBe('true');
	});

	it('writes one character per cell, and moves the focus to the next one', async () => {
		const changes: string[] = [];
		render(PinInputTest, { onChange: (value) => changes.push(value) });

		await userEvent.click(cell(0));
		await userEvent.keyboard('1');

		expect(boundValue()).toBe('1');
		expect(document.activeElement).toBe(cell(1));

		await userEvent.keyboard('2');

		expect(boundValue()).toBe('12');
		expect(document.activeElement).toBe(cell(2));
		expect(changes).toEqual(['1', '12']);
		expectNoFalseFocusAttributes();
	});

	it('refuses a character the type does not accept', async () => {
		render(PinInputTest, { type: 'numeric' });

		await userEvent.click(cell(0));
		await userEvent.keyboard('a');

		expect(boundValue()).toBe('');
		expect(cell(0).value).toBe('');
		expect(document.activeElement).toBe(cell(0));
	});

	it('takes the letters and the digits of an alphanumeric code', async () => {
		render(PinInputTest, { type: 'alphanumeric' });

		await userEvent.click(cell(0));
		await userEvent.keyboard('a1');

		expect(boundValue()).toBe('a1');
		expect(cell(0).inputMode).toBe('text');
	});

	it('takes a test of the consumer in place of the one of the type', async () => {
		render(PinInputTest, { type: 'alphanumeric', pattern: /[xyz]/ });

		await userEvent.click(cell(0));
		await userEvent.keyboard('ax');

		expect(boundValue()).toBe('x');
	});

	it('writes over the character of a cell that has one', async () => {
		render(PinInputTest, { defaultValue: '1234' });

		await userEvent.click(cell(1));
		await userEvent.keyboard('9');

		expect(boundValue()).toBe('1934');
	});

	it('reports the value one time when the last cell takes a character', async () => {
		const onComplete = vi.fn();
		render(PinInputTest, { defaultValue: '123', onComplete });

		await userEvent.click(cell(3));
		await userEvent.keyboard('4');

		expect(onComplete).toHaveBeenCalledTimes(1);
		expect(onComplete).toHaveBeenCalledWith('1234');
		expect(byTestId('root').getAttribute('data-complete')).toBe('true');
	});

	it('moves the focus off the last cell at the end, when the consumer asks for it', async () => {
		render(PinInputTest, { defaultValue: '123', blurOnComplete: true });

		await userEvent.click(cell(3));
		await userEvent.keyboard('4');

		expect(document.activeElement).not.toBe(cell(3));
	});

	it('spreads a code that arrives in one cell across the cells', async () => {
		render(PinInputTest);

		await userEvent.click(cell(0));
		await paste(cell(0), '4321');

		expect(boundValue()).toBe('4321');
		expect(cell(3).value).toBe('1');
		expect(document.activeElement).toBe(cell(3));
	});

	it('spreads a paste from the cell it starts in, and drops what is past the last cell', async () => {
		render(PinInputTest, { defaultValue: '9' });

		await userEvent.click(cell(1));
		await paste(cell(1), '12345');

		expect(boundValue()).toBe('9123');
	});

	it('drops the characters of a paste that the type refuses', async () => {
		render(PinInputTest);

		await userEvent.click(cell(0));
		await paste(cell(0), '1a2b3');

		expect(boundValue()).toBe('123');
	});

	it('clears the cell with Backspace, and the one before it when the cell is empty', async () => {
		render(PinInputTest, { defaultValue: '12' });

		await userEvent.click(cell(1));
		await userEvent.keyboard('{Backspace}');

		expect(boundValue()).toBe('1');
		expect(document.activeElement).toBe(cell(1));

		await userEvent.keyboard('{Backspace}');

		expect(boundValue()).toBe('');
		expect(document.activeElement).toBe(cell(0));
	});

	it('moves the characters after the one it removes to the left', async () => {
		render(PinInputTest, { defaultValue: '1234' });

		await userEvent.click(cell(0));
		await userEvent.keyboard('{Delete}');

		expect(boundValue()).toBe('234');
		expect(cell(0).value).toBe('2');
	});

	it('moves the focus with the arrows, with Home and with End', async () => {
		render(PinInputTest, { defaultValue: '1234' });

		await userEvent.click(cell(2));
		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement).toBe(cell(1));

		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		expect(document.activeElement).toBe(cell(3));

		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(cell(0));

		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(cell(3));
	});

	it('mirrors the arrows in a right-to-left context', async () => {
		render(PinInputTest, { defaultValue: '1234', dir: 'rtl' });

		await userEvent.click(cell(2));
		await userEvent.keyboard('{ArrowLeft}');

		expect(document.activeElement).toBe(cell(3));
	});

	it('sends the focus to the first cell that is open', async () => {
		render(PinInputTest, { defaultValue: '1' });

		await userEvent.click(cell(3));

		expect(document.activeElement).toBe(cell(1));
	});

	it('hides the characters when the consumer asks for it', async () => {
		render(PinInputTest, { defaultValue: '12', mask: true });

		expect(cell(0).type).toBe('password');
	});

	it('names the cells for a code that arrives in a message', async () => {
		const screen = render(PinInputTest, { otp: true, withLabel: false });

		expect(screen.getByRole('group', { name: 'Verification code' }).element()).toBe(
			byTestId('root')
		);
		expect(cell(0).autocomplete).toBe('one-time-code');
	});

	it('changes nothing while disabled, and leaves the cells out of the tab order', async () => {
		render(PinInputTest, { defaultValue: '1', disabled: true });

		await userEvent.keyboard('{Tab}{Tab}');
		expect(document.activeElement).toBe(byTestId('after'));
		expect(cell(0).disabled).toBe(true);
	});

	it('keeps the cells in the tab order while readonly, and changes nothing', async () => {
		render(PinInputTest, { defaultValue: '12', readonly: true });

		await userEvent.click(cell(1));
		await userEvent.keyboard('9');

		expect(boundValue()).toBe('12');
		expect(cell(1).readOnly).toBe(true);
	});

	it('refuses the change in controlled mode until the parent sends the value', async () => {
		const onChange = vi.fn();
		render(PinInputTest, { value: '12', controlledValue: true, onChange });

		await userEvent.click(cell(2));
		await userEvent.keyboard('3');

		expect(onChange).toHaveBeenCalledWith('123', expect.objectContaining({ reason: 'input' }));
		expect(cell(2).value).toBe('');
	});

	it('marks each cell as invalid and as necessary', async () => {
		render(PinInputTest, { invalid: true, required: true });

		expect(cell(0).getAttribute('aria-invalid')).toBe('true');
		expect(cell(0).required).toBe(true);
		expect(byTestId('root').getAttribute('data-invalid')).toBe('true');
	});

	it('carries the whole value in a form, and takes the first value back at a reset', async () => {
		render(PinInputFormTest, { defaultValue: '12' });

		const hidden = () =>
			byTestId<HTMLFormElement>('form').elements.namedItem('code') as HTMLInputElement;
		expect(hidden().value).toBe('12');

		await userEvent.click(cell(2));
		await userEvent.keyboard('3');
		expect(hidden().value).toBe('123');

		byTestId<HTMLButtonElement>('reset').click();
		await new Promise((resolve) => queueMicrotask(() => resolve(null)));
		await tick();

		expect(hidden().value).toBe('12');
	});
});
