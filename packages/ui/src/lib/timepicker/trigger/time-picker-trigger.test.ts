import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerTriggerForwardingTest from './time-picker-trigger-forwarding-test.svelte';

describe('TimePicker.Trigger', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('has aria-haspopup="dialog"', async () => {
		const screen = render(TimePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		expect(trigger.element()?.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('toggles aria-expanded when clicked', async () => {
		const screen = render(TimePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });
		const triggerElement = trigger.element();

		expect(triggerElement?.getAttribute('aria-expanded')).toBe('false');
		await trigger.click();
		await expect.poll(() => triggerElement?.getAttribute('aria-expanded')).toBe('true');
	});

	it('moves focus to last segment with ArrowLeft', async () => {
		const screen = render(TimePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		trigger.element()?.focus();
		trigger
			.element()
			?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

		await expect.poll(() => document.activeElement?.getAttribute('data-type')).toBe('minute');
		await expect
			.poll(() => document.activeElement?.getAttribute('data-focus-visible'))
			.toBe('true');
	});

	it('does not open when disabled', async () => {
		const screen = render(TimePickerTest, { disabled: true });
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		trigger.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(trigger.element()?.getAttribute('data-disabled')).toBe('true');
		expect(trigger.element()?.hasAttribute('disabled')).toBe(true);
	});

	it('is not rendered when readOnly', async () => {
		render(TimePickerTest, { readonly: true });

		expect(document.querySelector('button[aria-haspopup="dialog"]')).toBeNull();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('composes external trigger handlers with internal behavior', async () => {
		const screen = render(TimePickerTriggerForwardingTest);
		const trigger = screen.getByRole('button', { name: 'Open time picker' });

		trigger
			.element()
			?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		trigger.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		trigger
			.element()
			?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

		await expect
			.poll(() => document.querySelector('[data-testid="trigger-mousedown-count"]')?.textContent)
			.toBe('1');
		await expect
			.poll(() => document.querySelector('[data-testid="trigger-click-count"]')?.textContent)
			.toBe('1');
		await expect
			.poll(() => document.querySelector('[data-testid="trigger-key-count"]')?.textContent)
			.toBe('0');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
	});
});
