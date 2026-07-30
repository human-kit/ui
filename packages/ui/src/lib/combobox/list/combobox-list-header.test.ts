import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxListHeaderTest from './combobox-list-header-test.svelte';

function optionTexts() {
	return Array.from(document.querySelectorAll('[role="option"]'), (option) =>
		option.textContent?.trim()
	);
}

async function open() {
	const screen = render(ComboBoxListHeaderTest);
	const input = screen.getByRole('combobox');

	await input.click();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(screen.getByRole('listbox')).toBeInTheDocument();

	return { screen, input };
}

describe('ComboBox.List header', () => {
	it('renders above the options, inside the listbox', async () => {
		await open();

		expect(optionTexts()).toEqual(['Crear país', 'Argentina', 'Brasil', 'Colombia']);
	});

	// The header holds an action row, so it has to be reachable with the keyboard like any
	// other option — it is not part of the item array, only of the DOM.
	it('is the first thing arrow navigation lands on', async () => {
		const { input } = await open();

		await expect
			.poll(() => input.element().getAttribute('aria-activedescendant'))
			.toMatch(/create$/);
	});

	it('runs its action on Enter', async () => {
		const { screen } = await open();

		await userEvent.keyboard('{Enter}');

		await expect.element(screen.getByText('1')).toBeInTheDocument();
	});

	it('disappears with the rest when the filter matches nothing', async () => {
		const { input } = await open();

		await userEvent.fill(input.element() as HTMLInputElement, 'zzz');

		await expect.poll(() => optionTexts()).toEqual([]);
	});
});
