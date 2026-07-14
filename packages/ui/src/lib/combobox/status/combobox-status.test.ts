import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxStatusTest from './combobox-status-test.svelte';

function getStatus(): HTMLElement | null {
	// ButtonRoot (used by ComboBox.Trigger) renders its own pending live region;
	// exclude it so we always target the ComboBox.Status region.
	return document.querySelector(
		'[role="status"][aria-live="polite"]:not([data-button-live-region])'
	);
}

describe('ComboBox.Status', () => {
	it('renders a polite live region that stays silent while closed', async () => {
		render(ComboBoxStatusTest);

		const status = getStatus();
		expect(status).not.toBeNull();
		expect(status?.getAttribute('aria-atomic')).toBe('true');
		expect(status?.textContent?.trim()).toBe('');
	});

	it('announces the number of visible results while open', async () => {
		const screen = render(ComboBoxStatusTest);
		const input = screen.getByRole('combobox');

		// trigger="press" (default): clicking the input opens the popover.
		await input.click();
		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('3 results available');

		await userEvent.type(input.element(), 'Arg');
		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('1 result available');
	});

	it('announces "no results" when nothing matches', async () => {
		const screen = render(ComboBoxStatusTest);
		const input = screen.getByRole('combobox');

		await input.click();
		await userEvent.type(input.element(), 'zzz');

		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('No results available');
	});

	it('counts disabled-but-visible items', async () => {
		const screen = render(ComboBoxStatusTest, { disabledKeys: ['ar'] });
		const input = screen.getByRole('combobox');

		await input.click();
		// "Arg" only matches the disabled Argentina item, which is still rendered.
		await userEvent.type(input.element(), 'Arg');

		await expect.poll(() => screen.getByText('Argentina').query()).not.toBeNull();
		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('1 result available');
	});

	it('clears the announcement when the popover closes', async () => {
		const screen = render(ComboBoxStatusTest);
		const input = screen.getByRole('combobox');

		await input.click();
		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('3 results available');

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('');
	});

	it('supports a custom formatMessage', async () => {
		const screen = render(ComboBoxStatusTest, {
			formatMessage: (count: number) => `${count} países`
		});
		const input = screen.getByRole('combobox');

		await input.click();
		await expect.poll(() => getStatus()?.textContent?.trim()).toBe('3 países');
	});
});
