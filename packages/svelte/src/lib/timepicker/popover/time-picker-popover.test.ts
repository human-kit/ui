import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimePickerTest from '../root/time-picker-test.svelte';
import TimePickerPopoverUnsafePropsTest from './time-picker-popover-unsafe-props-test.svelte';

describe('TimePicker.Popover', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('is hidden by default', async () => {
		render(TimePickerTest);
		expect(document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('respects defaultOpen from root', async () => {
		render(TimePickerTest, { defaultOpen: true });
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('supports dialog accessible name', async () => {
		const screen = render(TimePickerTest, {
			defaultOpen: true,
			popoverAriaLabel: 'Time picker panel'
		});
		await expect.poll(() => document.querySelector<HTMLElement>('[role="dialog"]')).toBeTruthy();
		const dialog = screen.getByRole('dialog', { name: 'Time picker panel' });
		expect(dialog.element()).toBeTruthy();
	});

	it('ignores unsafe forbidden Popover props and preserves internal dialog id', async () => {
		render(TimePickerPopoverUnsafePropsTest);
		await expect.poll(() => document.querySelector<HTMLElement>('[role="dialog"]')).toBeTruthy();
		const dialog = document.querySelector<HTMLElement>('[role="dialog"]');

		expect(dialog?.id).not.toBe('unsafe-popover-id');
		expect(dialog?.id).toContain('-popover');
	});
});
