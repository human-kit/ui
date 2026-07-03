import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CalendarHeaderCellTest from './calendar-header-cell-test.svelte';

describe('Calendar.HeaderCell', () => {
	it('renders as columnheader', async () => {
		const screen = render(CalendarHeaderCellTest);
		const cell = screen.getByRole('columnheader');

		await expect.element(cell).toBeInTheDocument();
		await expect.element(cell).toHaveTextContent('Mon');
	});
});
