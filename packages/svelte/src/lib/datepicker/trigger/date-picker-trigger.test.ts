import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DatePickerTest from '../root/date-picker-test.svelte';

describe('DatePicker.Trigger', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('has aria-haspopup="dialog"', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		expect(trigger.element()?.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('toggles aria-expanded when clicked', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });
		const triggerElement = trigger.element();

		expect(triggerElement?.getAttribute('aria-expanded')).toBe('false');
		await trigger.click();
		await expect.poll(() => triggerElement?.getAttribute('aria-expanded')).toBe('true');
	});

	it('does not focus date input segments when clicked with mouse', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		expect(
			document.querySelector('[data-date-picker-segment="true"][data-focused="true"]')
		).toBeNull();
	});

	it('moves focus to last segment with ArrowLeft', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		trigger.element()?.focus();
		trigger
			.element()
			?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

		await expect.poll(() => document.activeElement?.getAttribute('data-type')).toBe('year');
		await expect
			.poll(() => document.activeElement?.getAttribute('data-focus-visible'))
			.toBe('true');
	});

	it('does not open when disabled', async () => {
		const screen = render(DatePickerTest, { isDisabled: true });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		trigger.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(trigger.element()?.getAttribute('data-disabled')).toBe('true');
		expect(trigger.element()?.hasAttribute('disabled')).toBe(true);
		expect(document.querySelector('[data-focus-within="true"]')).toBeNull();
	});

	it('is not rendered when readOnly', async () => {
		render(DatePickerTest, { isReadOnly: true });

		expect(document.querySelector('button[aria-haspopup="dialog"]')).toBeNull();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});
});
