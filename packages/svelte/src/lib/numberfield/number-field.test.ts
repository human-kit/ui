import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import {
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../test-utils/focus-contract';
import NumberFieldTest from './number-field-test.svelte';

function getValueOutput(): string | null {
	return document.querySelector('[data-number-field-value]')?.textContent ?? null;
}

function setInputText(input: HTMLInputElement, value: string) {
	input.value = value;
	input.dispatchEvent(new InputEvent('input', { bubbles: true, data: value }));
}

function pointerEvent(type: string, clientX: number): PointerEvent {
	return new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		pointerId: 1,
		button: 0,
		clientX
	});
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function expectRepeatStopsOn(stopEvent: 'pointerup' | 'pointercancel' | 'pointerleave') {
	const screen = render(NumberFieldTest, { defaultValue: 0 });
	const increment = screen.getByRole('button', { name: 'Increment' }).element();

	increment?.dispatchEvent(pointerEvent('pointerdown', 0));
	await wait(520);
	increment?.dispatchEvent(pointerEvent(stopEvent, 0));

	const valueAfterStop = getValueOutput();
	expect(Number(valueAfterStop)).toBeGreaterThan(1);

	await wait(180);
	expect(getValueOutput()).toBe(valueAfterStop);
}

describe('NumberField', () => {
	it('renders a spinbutton input and grouped steppers', () => {
		const screen = render(NumberFieldTest);
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		expect(input.element()?.tagName).toBe('INPUT');
		expect(input.element()?.getAttribute('type')).toBe('text');
		expect(input.element()?.getAttribute('inputmode')).toBe('decimal');
		expect(input.element()?.getAttribute('data-number-field-input')).toBe('true');
		expect(screen.getByRole('button', { name: 'Increment' }).element()).toBeInstanceOf(
			HTMLButtonElement
		);
		expect(screen.getByRole('button', { name: 'Decrement' }).element()).toBeInstanceOf(
			HTMLButtonElement
		);
	});

	it('supports defaultValue and bind:value', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 5 });
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		expect(input.element()).toHaveValue('5');
		await expect.poll(getValueOutput).toBe('5');
	});

	it('formats the initial value with LocaleProvider locale', () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 123456.78,
			locale: 'hi-IN-u-nu-deva',
			formatOptions: { maximumFractionDigits: 2 }
		});
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		expect(input.element()).toHaveValue('१,२३,४५६.७८');
	});

	it('formats Arabic-Indic digits from LocaleProvider locale', () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 9876.5,
			locale: 'ar-EG-u-nu-arab',
			formatOptions: { maximumFractionDigits: 1 }
		});
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		expect(input.element()).toHaveValue('٩٬٨٧٦٫٥');
	});

	it('updates bind:value from text input', async () => {
		const screen = render(NumberFieldTest);
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		setInputText(input.element() as HTMLInputElement, '12.5');

		await expect.poll(getValueOutput).toBe('12.5');
		expect(input.element()?.getAttribute('aria-valuenow')).toBe('12.5');
		expect(input.element()?.getAttribute('data-input-state')).toBe('synced');
	});

	it('does not expose stale aria value attributes for partial or invalid drafts', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 5 });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '-');

		await expect.poll(getValueOutput).toBe('5');
		expect(inputElement.getAttribute('aria-valuenow')).toBeNull();
		expect(inputElement.getAttribute('aria-valuetext')).toBeNull();
		expect(inputElement.getAttribute('data-input-state')).toBe('partial');
		expect(inputElement.getAttribute('data-invalid')).toBeNull();

		setInputText(inputElement, 'abc');

		await expect.poll(getValueOutput).toBe('5');
		expect(inputElement.getAttribute('aria-valuenow')).toBeNull();
		expect(inputElement.getAttribute('aria-valuetext')).toBeNull();
		expect(inputElement.getAttribute('data-input-state')).toBe('invalid');
		expect(inputElement.getAttribute('data-invalid')).toBe('true');
	});

	it('clamps direct out-of-range typing on blur when allowOutOfRange is false', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 5, min: 0, max: 10 });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		inputElement.focus();
		setInputText(inputElement, '99');

		await expect.poll(getValueOutput).toBe('5');
		expect(inputElement).toHaveValue('99');
		expect(inputElement.getAttribute('aria-valuenow')).toBeNull();
		expect(inputElement.getAttribute('data-input-state')).toBe('out-of-range');
		expect(inputElement.getAttribute('data-invalid')).toBe('true');
		expect(inputElement.checkValidity()).toBe(false);

		inputElement.blur();

		await expect.poll(() => inputElement.value).toBe('10');
		await expect.poll(getValueOutput).toBe('10');
		expect(inputElement.getAttribute('data-input-state')).toBe('synced');
		expect(inputElement.getAttribute('data-invalid')).toBeNull();
		expect(inputElement.checkValidity()).toBe(true);
	});

	it('keeps typing after an out-of-range draft and clamps to max on blur', async () => {
		const screen = render(NumberFieldTest, { defaultValue: null, min: 0, max: 100 });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		inputElement.focus();
		await userEvent.type(inputElement, '3333');

		await expect.poll(getValueOutput).toBe('33');
		expect(inputElement).toHaveValue('3333');
		expect(inputElement.getAttribute('aria-valuenow')).toBeNull();
		expect(inputElement.getAttribute('data-input-state')).toBe('out-of-range');
		expect(inputElement.getAttribute('data-invalid')).toBe('true');

		inputElement.blur();

		await expect.poll(getValueOutput).toBe('100');
		expect(inputElement).toHaveValue('100');
		expect(inputElement.getAttribute('aria-valuenow')).toBe('100');
		expect(inputElement.getAttribute('data-input-state')).toBe('synced');
	});

	it('sets native custom validity for invalid drafts and out-of-range values', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 5,
			min: 0,
			max: 10,
			allowOutOfRange: true
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, 'abc');
		await expect.poll(() => inputElement.validationMessage).toBe('Enter a valid number.');
		expect(inputElement.checkValidity()).toBe(false);

		setInputText(inputElement, '99');
		await expect.poll(getValueOutput).toBe('99');
		await expect.poll(() => inputElement.validationMessage).toBe('Value must be between 0 and 10.');
		expect(inputElement.checkValidity()).toBe(false);
	});

	it('allows direct out-of-range typing when allowOutOfRange is true', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 5,
			min: 0,
			max: 10,
			allowOutOfRange: true
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '99');

		await expect.poll(getValueOutput).toBe('99');
		expect(inputElement.getAttribute('aria-valuenow')).toBe('99');
		expect(inputElement.getAttribute('data-input-state')).toBe('synced');
		expect(inputElement.getAttribute('data-invalid')).toBe('true');

		inputElement.focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(getValueOutput).toBe('10');
	});

	it('uses localized default stepper labels from LocaleProvider', () => {
		const screen = render(NumberFieldTest, { locale: 'es-AR' });

		expect(screen.getByRole('button', { name: 'Incrementar' }).element()).toBeInstanceOf(
			HTMLButtonElement
		);
		expect(screen.getByRole('button', { name: 'Disminuir' }).element()).toBeInstanceOf(
			HTMLButtonElement
		);
	});

	it('lets explicit stepper labels override localized defaults', () => {
		const screen = render(NumberFieldTest, {
			locale: 'es-AR',
			incrementAriaLabel: 'Add one',
			decrementAriaLabel: 'Remove one'
		});

		expect(screen.getByRole('button', { name: 'Add one' }).element()).toBeInstanceOf(
			HTMLButtonElement
		);
		expect(screen.getByRole('button', { name: 'Remove one' }).element()).toBeInstanceOf(
			HTMLButtonElement
		);
	});

	it('formats and parses currency values through LocaleProvider', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 1234.5,
			formatOptions: { style: 'currency', currency: 'USD' }
		});
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		expect(input.element()).toHaveValue('$1,234.50');

		setInputText(input.element() as HTMLInputElement, '$2,000.25');

		await expect.poll(getValueOutput).toBe('2000.25');
	});

	it('rounds parsed currency values to the displayed fraction digits', async () => {
		const screen = render(NumberFieldTest, {
			formatOptions: { style: 'currency', currency: 'EUR' },
			locale: 'fr-FR'
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '0,003');
		await expect.poll(getValueOutput).toBe('0');

		setInputText(inputElement, '0,025');
		await expect.poll(getValueOutput).toBe('0.03');

		setInputText(inputElement, '0,024');
		await expect.poll(getValueOutput).toBe('0.02');

		setInputText(inputElement, '0,0000005');
		await expect.poll(getValueOutput).toBe('0');

		inputElement.blur();
		await expect.poll(() => inputElement.value).toBe('0,00 €');
	});

	it('rounds typed localized currency decimals on commit', async () => {
		const screen = render(NumberFieldTest, {
			formatOptions: { style: 'currency', currency: 'EUR' },
			locale: 'fr-FR'
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		inputElement.focus();
		await userEvent.type(inputElement, '0,025');

		await expect.poll(getValueOutput).toBe('0.03');
		expect(inputElement).toHaveValue('0,025');

		inputElement.blur();

		await expect.poll(() => inputElement.value).toBe('0,03 €');
		await expect.poll(getValueOutput).toBe('0.03');
	});

	it('rounds plain decimal values to maximumFractionDigits', async () => {
		const screen = render(NumberFieldTest, {
			formatOptions: { maximumFractionDigits: 2 }
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '0.024');
		await expect.poll(getValueOutput).toBe('0.02');

		setInputText(inputElement, '0.025');
		await expect.poll(getValueOutput).toBe('0.03');
	});

	it('parses percent values as literal numbers', async () => {
		const screen = render(NumberFieldTest, {
			formatOptions: { style: 'percent', maximumFractionDigits: 0 }
		});
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		setInputText(input.element() as HTMLInputElement, '50');

		await expect.poll(getValueOutput).toBe('50');
	});

	it('parses decimal percent values when fraction digits are allowed', async () => {
		const screen = render(NumberFieldTest, {
			formatOptions: { style: 'percent', maximumFractionDigits: 1 }
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '0.5');
		await expect.poll(getValueOutput).toBe('0.5');

		inputElement.blur();
		await expect.poll(() => inputElement.value).toBe('0.5%');
	});

	it('normalizes decimal-looking percent input when fraction digits are not allowed', async () => {
		const screen = render(NumberFieldTest, {
			formatOptions: { style: 'percent', maximumFractionDigits: 0 }
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '0.5');
		await expect.poll(getValueOutput).toBe('5');

		inputElement.blur();
		await expect.poll(() => inputElement.value).toBe('5%');
	});

	it('uses percent default fraction digits when maximumFractionDigits is omitted', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 25,
			formatOptions: { style: 'percent' }
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		expect(inputElement).toHaveValue('25%');

		setInputText(inputElement, '0.5');
		await expect.poll(getValueOutput).toBe('5');

		inputElement.blur();
		await expect.poll(() => inputElement.value).toBe('5%');
	});

	it('parses Devanagari digits from Hindi locale', async () => {
		const screen = render(NumberFieldTest, { locale: 'hi-IN-u-nu-deva' });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '१२३.४५');

		await expect.poll(getValueOutput).toBe('123.45');
		expect(inputElement.getAttribute('aria-valuenow')).toBe('123.45');
	});

	it('parses Arabic-Indic digits from Arabic locale', async () => {
		const screen = render(NumberFieldTest, { locale: 'ar-EG-u-nu-arab' });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '٩٬٨٧٦٫٥');

		await expect.poll(getValueOutput).toBe('9876.5');
		expect(inputElement.getAttribute('aria-valuenow')).toBe('9876.5');
	});

	it('increments and decrements with buttons', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 1, step: 2 });

		await screen.getByRole('button', { name: 'Increment' }).click();
		await expect.poll(getValueOutput).toBe('3');

		await screen.getByRole('button', { name: 'Decrement' }).click();
		await expect.poll(getValueOutput).toBe('1');
	});

	it('rounds stepper updates to the displayed fraction digits', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 0,
			step: 0.005,
			formatOptions: { maximumFractionDigits: 2 }
		});

		await screen.getByRole('button', { name: 'Increment' }).click();

		await expect.poll(getValueOutput).toBe('0.01');
	});

	it('keeps real focus on the input when steppers are clicked', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 1 });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;
		const group = document.querySelector('[data-number-field-group="true"]');
		const root = document.querySelector('[data-number-field-root="true"]');

		await screen.getByRole('button', { name: 'Increment' }).click();

		await expect.poll(() => document.activeElement).toBe(inputElement);
		expect(inputElement.getAttribute('data-focused')).toBe('true');
		expect(group?.getAttribute('data-focus-within')).toBe('true');
		expect(root?.getAttribute('data-focus-within')).toBe('true');
		expect(group?.getAttribute('data-focused')).toBeNull();
		expect(root?.getAttribute('data-focused')).toBeNull();
	});

	it('keeps steppers out of the tab order', async () => {
		const screen = render(NumberFieldTest);
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		expect(
			screen.getByRole('button', { name: 'Increment' }).element()?.getAttribute('tabindex')
		).toBe('-1');
		expect(
			screen.getByRole('button', { name: 'Decrement' }).element()?.getAttribute('tabindex')
		).toBe('-1');

		await userEvent.tab();
		expect(document.activeElement?.textContent).toBe('Before');
		await userEvent.tab();
		expect(document.activeElement).toBe(inputElement);
	});

	it('repeats stepping while a stepper is held', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 0 });
		const increment = screen.getByRole('button', { name: 'Increment' }).element();

		increment?.dispatchEvent(pointerEvent('pointerdown', 0));
		await wait(520);
		increment?.dispatchEvent(pointerEvent('pointerup', 0));

		await expect.poll(() => Number(getValueOutput())).toBeGreaterThan(1);
	});

	it('stops held increment at max', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 4, min: 0, max: 5 });
		const increment = screen.getByRole('button', { name: 'Increment' }).element();

		increment?.dispatchEvent(pointerEvent('pointerdown', 0));
		await wait(650);
		increment?.dispatchEvent(pointerEvent('pointerup', 0));

		await expect.poll(getValueOutput).toBe('5');
		expect(increment?.getAttribute('data-disabled')).toBe('true');
	});

	it('stops held decrement at min', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 1, min: 0, max: 5 });
		const decrement = screen.getByRole('button', { name: 'Decrement' }).element();

		decrement?.dispatchEvent(pointerEvent('pointerdown', 0));
		await wait(650);
		decrement?.dispatchEvent(pointerEvent('pointerup', 0));

		await expect.poll(getValueOutput).toBe('0');
		expect(decrement?.getAttribute('data-disabled')).toBe('true');
	});

	it('stops repeat timers on pointer release', async () => {
		await expectRepeatStopsOn('pointerup');
	});

	it('stops repeat timers on pointer cancel', async () => {
		await expectRepeatStopsOn('pointercancel');
	});

	it('stops repeat timers on pointer leave', async () => {
		await expectRepeatStopsOn('pointerleave');
	});

	it('supports keyboard stepping and min/max shortcuts', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 5, min: 0, max: 20, step: 2 });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		inputElement.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(getValueOutput).toBe('7');

		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
		await expect.poll(getValueOutput).toBe('17');

		await userEvent.keyboard('{PageDown}');
		await expect.poll(getValueOutput).toBe('15');

		await userEvent.keyboard('{Home}');
		await expect.poll(getValueOutput).toBe('0');

		await userEvent.keyboard('{End}');
		await expect.poll(getValueOutput).toBe('20');
	});

	it('updates from wheel only when wheel scrub is enabled', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 1, allowWheelScrub: true });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		inputElement.focus();
		await userEvent.hover(inputElement);
		inputElement.dispatchEvent(
			new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -1 })
		);

		await expect.poll(getValueOutput).toBe('2');
	});

	it('updates from pointer scrub', async () => {
		render(NumberFieldTest, { defaultValue: 1 });
		const scrubArea = document.querySelector('[data-testid="scrub-area"]');

		scrubArea?.dispatchEvent(pointerEvent('pointerdown', 0));
		scrubArea?.dispatchEvent(pointerEvent('pointermove', 6));
		scrubArea?.dispatchEvent(pointerEvent('pointerup', 6));

		await expect.poll(getValueOutput).toBe('4');
	});

	it('submits the raw number value when name is provided', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 25,
			name: 'amount',
			formatOptions: { style: 'currency', currency: 'USD' }
		});

		await screen.getByRole('button', { name: 'Submit' }).click();

		expect(document.querySelector('[data-form-entries]')?.textContent).toBe('{"amount":"25"}');
	});

	it('blocks form submission when required value is empty', async () => {
		const screen = render(NumberFieldTest, { required: true, name: 'amount' });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		await screen.getByRole('button', { name: 'Submit' }).click();

		expect(inputElement.checkValidity()).toBe(false);
		expect(document.querySelector('[data-form-entries]')?.textContent).toBe('');
	});

	it('blocks form submission for invalid draft text', async () => {
		const screen = render(NumberFieldTest, { defaultValue: 5, name: 'amount' });
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, 'abc');
		await expect.poll(() => inputElement.checkValidity()).toBe(false);
		await screen.getByRole('button', { name: 'Submit' }).click();

		expect(document.querySelector('[data-form-entries]')?.textContent).toBe('');
	});

	it('blocks form submission for out-of-range values when allowed to type them', async () => {
		const screen = render(NumberFieldTest, {
			defaultValue: 5,
			min: 0,
			max: 10,
			allowOutOfRange: true,
			name: 'amount'
		});
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		setInputText(inputElement, '99');
		await expect.poll(() => inputElement.checkValidity()).toBe(false);
		await screen.getByRole('button', { name: 'Submit' }).click();

		expect(document.querySelector('[data-form-entries]')?.textContent).toBe('');
	});

	it('maps aria-invalid on Root to group and input invalid attributes', () => {
		const screen = render(NumberFieldTest, { 'aria-invalid': 'true' });
		const input = screen.getByRole('spinbutton', { name: 'Amount' });
		const group = document.querySelector('[data-number-field-group="true"]');

		expect(input.element()?.getAttribute('aria-invalid')).toBe('true');
		expect(input.element()?.getAttribute('data-invalid')).toBe('true');
		expect(group?.getAttribute('data-invalid')).toBe('true');
	});

	it('maps invalid, required, disabled, and readonly state to accessible attributes', () => {
		const screen = render(NumberFieldTest, {
			invalid: true,
			required: true,
			disabled: true,
			readonly: true
		});
		const input = screen.getByRole('spinbutton', { name: 'Amount' });

		expect(input.element()?.getAttribute('aria-invalid')).toBe('true');
		expect(input.element()?.getAttribute('aria-required')).toBe('true');
		expect(input.element()?.getAttribute('aria-disabled')).toBe('true');
		expect(input.element()?.getAttribute('aria-readonly')).toBe('true');
		expect(input.element()?.getAttribute('data-disabled')).toBe('true');
	});

	it('follows the focus-visible data attribute contract', async () => {
		const screen = render(NumberFieldTest);
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;

		await userEvent.tab();
		await userEvent.tab();

		await expect.poll(() => inputElement.getAttribute('data-focus-visible')).toBe('true');
		expectFocusVisibleImpliesFocused(inputElement);
		expect(document.querySelectorAll('[data-focused="true"]')).toHaveLength(1);
		expect(document.querySelectorAll('[data-focus-visible="true"]')).toHaveLength(1);
		expectNoFalseFocusAttributes(document);
	});

	it('scopes focus state attributes to the input and focus-within to containers', async () => {
		const screen = render(NumberFieldTest);
		const inputElement = screen
			.getByRole('spinbutton', { name: 'Amount' })
			.element() as HTMLInputElement;
		const root = document.querySelector('[data-number-field-root="true"]');
		const group = document.querySelector('[data-number-field-group="true"]');
		const increment = screen.getByRole('button', { name: 'Increment' }).element();
		const decrement = screen.getByRole('button', { name: 'Decrement' }).element();

		await userEvent.tab();
		await userEvent.tab();

		await expect.poll(() => inputElement.getAttribute('data-focus-visible')).toBe('true');
		expect(inputElement.getAttribute('data-focused')).toBe('true');
		expect(root?.getAttribute('data-focus-within')).toBe('true');
		expect(group?.getAttribute('data-focus-within')).toBe('true');

		expect(root?.getAttribute('data-focused')).toBeNull();
		expect(root?.getAttribute('data-focus-visible')).toBeNull();
		expect(group?.getAttribute('data-focused')).toBeNull();
		expect(group?.getAttribute('data-focus-visible')).toBeNull();
		expect(increment?.getAttribute('data-focused')).toBeNull();
		expect(increment?.getAttribute('data-focus-visible')).toBeNull();
		expect(decrement?.getAttribute('data-focused')).toBeNull();
		expect(decrement?.getAttribute('data-focus-visible')).toBeNull();
		expect(
			document.querySelectorAll('[data-focused="true"]:not([data-number-field-input="true"])')
		).toHaveLength(0);
		expect(
			document.querySelectorAll('[data-focus-visible="true"]:not([data-number-field-input="true"])')
		).toHaveLength(0);
	});
});
