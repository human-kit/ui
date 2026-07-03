import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ListBoxNumericIdTest from './listbox-numeric-id-test.svelte';

describe('ListBox keyboard id typing', () => {
	it('keeps numeric-like string ids as strings', async () => {
		const screen = render(ListBoxNumericIdTest);
		const listbox = screen.getByRole('listbox');

		await listbox.click();
		await userEvent.keyboard('{Home}');
		await userEvent.keyboard('{Enter}');

		expect(screen.getByTestId('selected').element().textContent).toBe('01');
		expect(screen.getByTestId('selected-type').element().textContent).toBe('string');
	});

	it('keeps number ids as numbers', async () => {
		const screen = render(ListBoxNumericIdTest);
		const listbox = screen.getByRole('listbox');

		await listbox.click();
		await userEvent.keyboard('{End}');
		await userEvent.keyboard('{Enter}');

		expect(screen.getByTestId('selected').element().textContent).toBe('3');
		expect(screen.getByTestId('selected-type').element().textContent).toBe('number');
	});
});
