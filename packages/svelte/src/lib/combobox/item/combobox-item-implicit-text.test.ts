import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxItemImplicitTextTest from './combobox-item-implicit-text-test.svelte';

describe('ComboBox.Item implicit textValue', () => {
	it('filters by rendered label when textValue prop is omitted', async () => {
		const screen = render(ComboBoxItemImplicitTextTest);
		const input = screen.getByRole('combobox');

		await input.click();
		await userEvent.keyboard('braz');

		const listbox = screen.getByRole('listbox').element();
		const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
		expect(options.length).toBe(1);
		expect(options[0].textContent).toContain('Brazil');
	});

	it('selects with keyboard using rendered label when textValue prop is omitted', async () => {
		const screen = render(ComboBoxItemImplicitTextTest);
		const input = screen.getByRole('combobox');

		await input.click();
		await userEvent.keyboard('braz');
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');

		await expect.element(input).toHaveValue('Brazil');
		expect(screen.getByTestId('selected').element().textContent).toBe('br');
	});
});
