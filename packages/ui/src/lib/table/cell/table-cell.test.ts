import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from '../root/table-test.svelte';

describe('Table.Cell', () => {
	it('renders row-header semantics for the first body column', async () => {
		render(TableTest);
		expect(document.querySelector('tbody [role="rowheader"]')?.textContent).toContain(
			'danilo@example.com'
		);
	});

	// The modality can change while the element already holds focus, and no focus event fires
	// to report it. A key that the component ignores must bring the ring back, the same as in
	// React Aria and Base UI.
	it('shows the focus ring when a key press follows a pointer press', async () => {
		render(TableTest);
		const cell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		await userEvent.click(cell);
		await expect.poll(() => cell.getAttribute('data-focused')).toBe('true');
		expect(cell.getAttribute('data-focus-visible')).toBeNull();

		await userEvent.keyboard('{F9}');
		await expect.poll(() => cell.getAttribute('data-focus-visible')).toBe('true');
	});
});
