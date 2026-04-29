import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from '../root/table-test.svelte';

describe('Table.SortTrigger', () => {
	it('keeps the header cell as the grid tab stop and toggles sort explicitly', async () => {
		render(TableTest);

		const groupHeader = document.querySelectorAll<HTMLElement>('thead [role="columnheader"]')[1]!;
		const groupSortTrigger = document.querySelector<HTMLElement>(
			'[data-testid="group-sort-trigger"]'
		)!;

		groupHeader.focus();

		await expect.poll(() => document.activeElement).toBe(groupHeader);
		expect(groupHeader.getAttribute('tabindex')).toBe('-1');
		expect(groupSortTrigger.getAttribute('tabindex')).toBeNull();
		expect(groupSortTrigger.getAttribute('data-sort-direction-state')).toBe('none');

		await userEvent.click(groupSortTrigger);

		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');
		await expect.element(groupHeader).toHaveAttribute('aria-sort', 'ascending');
		await expect.poll(() => groupSortTrigger.getAttribute('data-sorted')).toBe('true');
		await expect
			.poll(() => groupSortTrigger.getAttribute('data-sort-direction-state'))
			.toBe('ascending');
	});

	it('keeps the snippet sortDirection in sync for controlled initial, toggle, and clear states', async () => {
		render(TableTest, {
			initialSortDescriptor: { column: 'group', direction: 'ascending' },
			showSortClearButton: true
		});

		const groupHeader = document.querySelectorAll<HTMLElement>('thead [role="columnheader"]')[1]!;
		const groupSortTrigger = document.querySelector<HTMLElement>(
			'[data-testid="group-sort-trigger"]'
		)!;
		const clearSortButton = document.querySelector<HTMLElement>('[data-testid="clear-sort"]')!;

		await expect.element(groupHeader).toHaveAttribute('aria-sort', 'ascending');
		await expect
			.poll(() => groupSortTrigger.getAttribute('data-sort-direction-state'))
			.toBe('ascending');

		await userEvent.click(groupSortTrigger);

		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:descending');
		await expect.element(groupHeader).toHaveAttribute('aria-sort', 'descending');
		await expect
			.poll(() => groupSortTrigger.getAttribute('data-sort-direction-state'))
			.toBe('descending');

		await userEvent.click(clearSortButton);

		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('');
		await expect.element(groupHeader).toHaveAttribute('aria-sort', 'none');
		await expect
			.poll(() => groupSortTrigger.getAttribute('data-sort-direction-state'))
			.toBe('none');
		await expect.poll(() => groupSortTrigger.getAttribute('data-sorted')).toBeNull();
	});

	it('allows tabbing from the header cell into the nested trigger button', async () => {
		render(TableTest);

		const groupHeader = document.querySelectorAll<HTMLElement>('thead [role="columnheader"]')[1]!;
		const groupSortTrigger = document.querySelector<HTMLElement>(
			'[data-testid="group-sort-trigger"]'
		)!;

		groupHeader.focus();
		await userEvent.keyboard('{Tab}');

		await expect.poll(() => document.activeElement).toBe(groupSortTrigger);
	});
});
