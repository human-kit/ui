import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxPopoverPropsTest from './combobox-popover-props-test.svelte';

describe('ComboBox.Popover forwarded props', () => {
	it('forwards placement to the underlying popover content', async () => {
		const screen = render(ComboBoxPopoverPropsTest, {
			placement: 'top-start',
			shouldFlip: false
		});
		const input = screen.getByRole('combobox');

		await input.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		await expect
			.poll(() => document.querySelector('[role="dialog"]')?.getAttribute('data-placement'))
			.toBe('top');
	});

	it('forwards shouldCloseOnEscape=false to keep the popover open', async () => {
		const screen = render(ComboBoxPopoverPropsTest, { shouldCloseOnEscape: false });
		const input = screen.getByRole('combobox');

		await input.click();
		await expect.element(screen.getByRole('listbox')).toBeVisible();

		await userEvent.keyboard('{Escape}');

		await expect.element(screen.getByRole('listbox')).toBeVisible();
	});
});
