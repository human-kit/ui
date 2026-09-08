import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from '../root/table-test.svelte';

describe('Table.ColumnHeaderCell', () => {
	it('reflects sortable state on sortable columns', async () => {
		render(TableTest);
		const headers = document.querySelectorAll<HTMLElement>('thead [role="columnheader"]');
		await expect.poll(() => headers[1]?.getAttribute('data-sortable')).toBe('true');
	});

	// The modality can change while the element already holds focus, and no focus event fires
	// to report it. A key that the component ignores must bring the ring back, the same as in
	// React Aria and Base UI.
	it('shows the focus ring when a key press follows a pointer press', async () => {
		render(TableTest);
		const header = document.querySelectorAll<HTMLElement>('thead [role="columnheader"]')[0]!;

		await userEvent.click(header);
		await expect.poll(() => header.getAttribute('data-focused')).toBe('true');
		expect(header.getAttribute('data-focus-visible')).toBeNull();

		await userEvent.keyboard('{F9}');
		await expect.poll(() => header.getAttribute('data-focus-visible')).toBe('true');
	});
});
