import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ListBoxMixedIdTest from './listbox-mixed-id-test.svelte';

function optionFor(screen: ReturnType<typeof render>, text: string): HTMLElement {
	return screen.getByText(text).element().closest('[role="option"]') as HTMLElement;
}

describe('ListBox mixed id types ("1" vs 1)', () => {
	it('tracks focus strictly per id type (no String coercion)', async () => {
		const screen = render(ListBoxMixedIdTest);

		await screen.getByText('String one').click();

		const stringItem = optionFor(screen, 'String one');
		const numberItem = optionFor(screen, 'Number one');

		await expect.poll(() => stringItem.getAttribute('data-focused')).toBe('true');
		// The numeric id 1 is a different item: it must never mirror the focus
		// of the string id "1" (Sets compare strictly; focus must match).
		expect(numberItem.hasAttribute('data-focused')).toBe(false);
		expect(document.querySelectorAll('[role="option"][data-focused]').length).toBe(1);
	});

	it('selects strictly per id type', async () => {
		const screen = render(ListBoxMixedIdTest);

		await screen.getByText('Number one').click();

		expect(screen.getByTestId('selected').element().textContent).toBe('number:1');

		const stringItem = optionFor(screen, 'String one');
		const numberItem = optionFor(screen, 'Number one');
		expect(numberItem.getAttribute('aria-selected')).toBe('true');
		expect(stringItem.getAttribute('aria-selected')).toBe('false');
	});
});
