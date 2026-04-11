import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from './table-test.svelte';
import TableReorderTest from './table-reorder-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function getHeaderCells(container: HTMLElement) {
	return Array.from(container.querySelectorAll<HTMLElement>('thead [role="columnheader"]'));
}

function getBodyFirstColumnCells(container: HTMLElement) {
	return Array.from(container.querySelectorAll<HTMLElement>('tbody [role="rowheader"]'));
}

function getBodySecondColumnCells(container: HTMLElement) {
	return Array.from(container.querySelectorAll<HTMLElement>('tbody [role="gridcell"]'));
}

describe('Table.Root', () => {
	it('renders a grid with header, body and footer groups', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid');

		await expect.element(grid).toBeInTheDocument();
		expect(document.querySelector('thead')).toBeTruthy();
		expect(document.querySelector('tbody')).toBeTruthy();
		expect(document.querySelector('tfoot')).toBeTruthy();
	});

	it('exposes aria row and column counts on the grid', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid');

		await expect.element(grid).toHaveAttribute('aria-colcount', '2');
		await expect.element(grid).toHaveAttribute('aria-rowcount', '4');
	});

	it('hides configured columns across header, body, and footer while keeping visible column counts accurate', async () => {
		const screen = render(TableTest, {
			defaultHiddenColumns: ['group']
		});
		const grid = screen.getByRole('grid').element() as HTMLElement;

		await expect.element(grid).toHaveAttribute('aria-colcount', '1');
		expect(
			document.querySelector('[role="columnheader"][data-column-index="0"]')?.textContent?.trim()
		).toBe('Email');
		expect(
			document.querySelector('[role="columnheader"]:nth-child(2)')?.getAttribute('aria-hidden')
		).toBe('true');
		expect(document.querySelector('tbody tr td[aria-hidden="true"]')?.textContent?.trim()).toBe(
			'Developer'
		);
		expect(document.querySelector('tfoot td[aria-hidden="true"]')?.textContent?.trim()).toBe(
			'3 users'
		);
	});

	it('updates hidden columns reactively through binding controls', async () => {
		render(TableTest, {
			showHiddenColumnsToggle: true
		});

		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="hide-group-column"]')!
		);

		await expect
			.poll(() => document.querySelector('[data-testid="hidden-columns"]')?.textContent)
			.toBe('["group"]');
		await expect
			.poll(() => document.querySelector('[role="grid"]')?.getAttribute('aria-colcount'))
			.toBe('1');

		await userEvent.click(document.querySelector<HTMLElement>('[data-testid="show-all-columns"]')!);

		await expect
			.poll(() => document.querySelector('[data-testid="hidden-columns"]')?.textContent)
			.toBe('[]');
		await expect
			.poll(() => document.querySelector('[role="grid"]')?.getAttribute('aria-colcount'))
			.toBe('2');
	});

	it('skips hidden columns during horizontal keyboard navigation', async () => {
		render(TableTest, {
			defaultHiddenColumns: ['group']
		});
		const firstHeaderCell = document.querySelector<HTMLElement>('thead [role="columnheader"]');

		firstHeaderCell?.focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Email');
	});

	it('moves focus to nearest visible cell when the focused column is hidden', async () => {
		render(TableTest, {
			showHiddenColumnsToggle: true
		});

		const groupCell = document.querySelector<HTMLElement>('tbody tr:first-child td:nth-child(2)');
		groupCell?.focus();
		await expect.poll(() => document.activeElement).toBe(groupCell);

		// Use pointerdown + click to hide the column without stealing focus permanently
		const hideButton = document.querySelector<HTMLElement>('[data-testid="hide-group-column"]')!;
		hideButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		hideButton.click();

		await expect
			.poll(() => {
				const active = document.activeElement;
				if (!active || active === document.body) return null;
				return active.textContent?.trim();
			})
			.toBe('danilo@example.com');
	});

	it('exposes aria-colindex on visible cells (1-indexed)', async () => {
		render(TableTest);

		await expect
			.poll(() => document.querySelector('[role="columnheader"]')?.getAttribute('aria-colindex'))
			.toBe('1');
		await expect
			.poll(() =>
				document.querySelectorAll('[role="columnheader"]')[1]?.getAttribute('aria-colindex')
			)
			.toBe('2');

		const firstBodyCell = document.querySelector<HTMLElement>(
			'tbody tr:first-child [role="rowheader"]'
		);
		expect(firstBodyCell?.getAttribute('aria-colindex')).toBe('1');
	});

	it('excludes footer cells from grid semantics', async () => {
		render(TableTest);

		expect(document.querySelector('tfoot')?.getAttribute('role')).toBe('none');
		for (const cell of document.querySelectorAll('tfoot td, tfoot th')) {
			expect(cell.getAttribute('role')).toBeNull();
		}
	});

	it('warns in dev when the grid has no accessible name', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		try {
			render(TableTest, {
				ariaLabel: '',
				ariaLabelledby: undefined
			});

			await expect
				.poll(() => warnSpy.mock.calls)
				.toContainEqual([
					'[Table.Root]: Provide either "aria-label" or "aria-labelledby" so the grid has an accessible name.'
				]);
		} finally {
			warnSpy.mockRestore();
		}
	});

	it('makes the first header cell the initial tab stop', async () => {
		render(TableTest);
		const firstHeaderCell = document.querySelector<HTMLElement>('thead [role="columnheader"]');
		expect(firstHeaderCell?.getAttribute('tabindex')).toBe('0');
		expect(firstHeaderCell?.getAttribute('data-focused')).toBeNull();
	});

	it('moves focus horizontally with arrow keys', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid').element() as HTMLElement;
		const [emailHeader, groupHeader] = getHeaderCells(grid);

		emailHeader.focus();
		await userEvent.keyboard('{ArrowRight}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Group');
		expect(groupHeader.getAttribute('data-focused')).toBe('true');
	});

	it('moves focus vertically from header to body cells', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid').element() as HTMLElement;
		const [emailHeader] = getHeaderCells(grid);

		emailHeader.focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('danilo@example.com');
	});

	it('updates header and body column indices when keyed columns reorder', async () => {
		render(TableReorderTest);

		expect(
			document.querySelector('[data-testid="email-header"]')?.getAttribute('data-column-index')
		).toBe('0');
		expect(
			document.querySelector('[data-testid="group-header"]')?.getAttribute('data-column-index')
		).toBe('1');
		expect(
			document.querySelector('[data-testid="email-cell-danilo"]')?.getAttribute('data-column-index')
		).toBe('0');
		expect(
			document.querySelector('[data-testid="group-cell-danilo"]')?.getAttribute('data-column-index')
		).toBe('1');
		expect(document.querySelector('[data-testid="email-cell-danilo"]')?.getAttribute('role')).toBe(
			'rowheader'
		);
		expect(document.querySelector('[data-testid="group-cell-danilo"]')?.getAttribute('role')).toBe(
			'gridcell'
		);

		await userEvent.click(document.querySelector<HTMLElement>('[data-testid="toggle-order"]')!);

		await expect
			.poll(() =>
				document.querySelector('[data-testid="group-header"]')?.getAttribute('data-column-index')
			)
			.toBe('0');
		await expect
			.poll(() =>
				document.querySelector('[data-testid="email-header"]')?.getAttribute('data-column-index')
			)
			.toBe('1');
		await expect
			.poll(() =>
				document
					.querySelector('[data-testid="group-cell-danilo"]')
					?.getAttribute('data-column-index')
			)
			.toBe('0');
		await expect
			.poll(() =>
				document
					.querySelector('[data-testid="email-cell-danilo"]')
					?.getAttribute('data-column-index')
			)
			.toBe('1');
		await expect
			.poll(() => document.querySelector('[data-testid="group-cell-danilo"]')?.getAttribute('role'))
			.toBe('gridcell');
		await expect
			.poll(() => document.querySelector('[data-testid="email-cell-danilo"]')?.getAttribute('role'))
			.toBe('rowheader');
	});

	it('moves to row boundaries with Home and End', async () => {
		render(TableTest);
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];

		firstBodyCell.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Developer');

		await userEvent.keyboard('{Home}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('danilo@example.com');

		await userEvent.keyboard('{End}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Developer');
	});

	it('moves focus to the body row when navigating past the last cell and back into the row', async () => {
		render(TableTest);
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];
		const firstRow = document.querySelector<HTMLElement>('tbody tr')!;

		firstBodyCell.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Developer');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(firstRow);
		await expect.poll(() => firstRow.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => firstRow.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Developer');
	});

	it('loops horizontally from a focused body row edge back to the first or last cell', async () => {
		render(TableTest);
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];

		firstBodyCell.focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		await expect
			.poll(() => document.activeElement?.textContent?.trim())
			.toBe('danilo@example.com Developer');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('danilo@example.com');

		await userEvent.keyboard('{ArrowLeft}');
		await expect
			.poll(() => document.activeElement?.textContent?.trim())
			.toBe('danilo@example.com Developer');

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Developer');
	});

	it('preserves row-edge focus while moving vertically between body rows', async () => {
		render(TableTest, { selectionMode: 'multiple' });
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];
		const rows = Array.from(document.querySelectorAll<HTMLElement>('tbody tr'));

		firstBodyCell.focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(rows[0]);

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(rows[1]);
		await expect.poll(() => rows[1].getAttribute('data-focused')).toBe('true');

		await userEvent.keyboard(' ');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('zahra');
	});

	it('moves to the first and last body rows with Home and End while a body row is focused', async () => {
		render(TableTest);
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];
		const rows = Array.from(document.querySelectorAll<HTMLElement>('tbody tr'));

		firstBodyCell.focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(rows[1]);

		await userEvent.keyboard('{End}');
		await expect.poll(() => document.activeElement).toBe(rows[2]);

		await userEvent.keyboard('{Home}');
		await expect.poll(() => document.activeElement).toBe(rows[0]);
	});

	it('moves to grid boundaries with Ctrl+Home and Ctrl+End', async () => {
		render(TableTest);
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];

		firstBodyCell.focus();
		await userEvent.keyboard('{Control>}{End}{/Control}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Developer');

		await userEvent.keyboard('{Control>}{Home}{/Control}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('Email');
	});

	it('selects a body row with keyboard', async () => {
		render(TableTest, { selectionMode: 'multiple' });
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]');
		firstBodyCell?.focus();

		await userEvent.keyboard(' ');

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('danilo');
		expect(document.querySelector('tbody tr')?.getAttribute('data-selected')).toBe('true');
	});

	it('toggles off an already selected row when selectionBehavior is toggle', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'toggle',
			initialSelectedKeys: ['danilo']
		});
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		await userEvent.click(firstBodyCell);

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('[]');
		expect(document.querySelector('tbody tr')?.getAttribute('data-selected')).toBeNull();
	});

	it('clears selection when selectionMode changes to none', async () => {
		const screen = render(TableTest, {
			selectionMode: 'multiple',
			initialSelectedKeys: ['danilo', 'zahra'],
			showSelectionModeToggle: true
		});

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo","zahra"]');

		await screen.getByTestId('set-selection-mode-none').click();

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('[]');
		expect(document.querySelector('tbody tr[data-selected="true"]')).toBeNull();
	});

	it('collapses selection to one row when selectionMode changes to single', async () => {
		const screen = render(TableTest, {
			selectionMode: 'multiple',
			initialSelectedKeys: ['danilo', 'zahra'],
			showSingleSelectionModeToggle: true
		});

		await screen.getByTestId('set-selection-mode-single').click();

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo"]');
		expect(document.querySelectorAll('tbody tr[data-selected="true"]')).toHaveLength(1);
	});

	it('keeps an already selected row selected when selectionBehavior is replace', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace',
			initialSelectedKeys: ['danilo']
		});
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		await userEvent.click(firstBodyCell);

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('danilo');
		expect(document.querySelector('tbody tr')?.getAttribute('data-selected')).toBe('true');
	});

	it('replaces selection on click when selectionBehavior is replace', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const firstCell = getBodyFirstColumnCells(document.body)[0];
		const secondCell = getBodyFirstColumnCells(document.body)[1];

		await userEvent.click(firstCell);
		await userEvent.click(secondCell);

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.not.toContain('danilo');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('zahra');
	});

	it('adds a non-contiguous row with Ctrl+Space when selectionBehavior is replace', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const firstCell = getBodyFirstColumnCells(document.body)[0];
		const thirdCell = getBodyFirstColumnCells(document.body)[2];

		await userEvent.click(firstCell);
		thirdCell.focus();
		await userEvent.keyboard('{Control>} {/Control}');

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('danilo');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('jasper');
	});

	it('moves focus and selection together with vertical arrows in replace mode', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		firstBodyCell.focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('zahra@example.com');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["zahra"]');
	});

	it('extends selection with Shift+ArrowDown in replace mode', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		await userEvent.click(firstBodyCell);
		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('zahra@example.com');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('danilo');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('zahra');
	});

	it('preserves the bottom anchor when extending upward with Shift+ArrowUp in replace mode', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace'
		});
		const thirdBodyCell = getBodyFirstColumnCells(document.body)[2];

		await userEvent.click(thirdBodyCell);
		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('danilo@example.com');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('danilo');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('zahra');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('jasper');
	});

	it('extends selection with Shift+ArrowDown in toggle multiple mode', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'toggle'
		});
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		firstBodyCell.focus();
		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');

		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('zahra@example.com');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('danilo');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('zahra');
	});

	it('ignores repeated Space keydown when toggling row selection', async () => {
		render(TableTest, { selectionMode: 'multiple', selectionBehavior: 'toggle' });
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		firstBodyCell.focus();
		firstBodyCell.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		firstBodyCell.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true, repeat: true })
		);

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo"]');
	});

	it('ignores repeated Space keydown when toggling sorting', async () => {
		render(TableTest);
		const grid = document.querySelector<HTMLElement>('[role="grid"]')!;
		const [, groupHeader] = getHeaderCells(grid);

		groupHeader.focus();
		groupHeader.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		groupHeader.dispatchEvent(
			new KeyboardEvent('keydown', { key: ' ', bubbles: true, repeat: true })
		);

		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');
		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')?.textContent
			)
			.toBe('Group sorted ascending.');
	});

	it('toggles sorting from a sortable header cell', async () => {
		render(TableTest);
		const grid = document.querySelector<HTMLElement>('[role="grid"]')!;
		const [, groupHeader] = getHeaderCells(grid);

		await groupHeader.click();
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');

		await groupHeader.click();
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:descending');
	});

	it('does not announce the initial sort state on mount', async () => {
		render(TableTest, {
			initialSortDescriptor: { column: 'group', direction: 'ascending' }
		});

		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')?.textContent
			)
			.toBe('');
	});

	it('announces sort changes through a polite live region', async () => {
		render(TableTest);
		const grid = document.querySelector<HTMLElement>('[role="grid"]')!;
		const [, groupHeader] = getHeaderCells(grid);

		await groupHeader.click();
		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')?.textContent
			)
			.toBe('Group sorted ascending.');

		await groupHeader.click();
		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')?.textContent
			)
			.toBe('Group sorted descending.');
	});

	it('clears controlled sorting when sortDescriptor becomes undefined', async () => {
		const screen = render(TableTest, {
			initialSortDescriptor: { column: 'group', direction: 'ascending' },
			showSortClearButton: true
		});

		const [, groupHeader] = getHeaderCells(document.body);

		await expect.element(groupHeader).toHaveAttribute('aria-sort', 'ascending');
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');

		await screen.getByTestId('clear-sort').click();

		await expect.element(groupHeader).toHaveAttribute('aria-sort', 'none');
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('');
		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[role="status"][aria-live="polite"]')?.textContent
			)
			.toBe('Sorting cleared.');
	});

	it('cycles keyboard sorting between ascending and descending without a clear state', async () => {
		render(TableTest);
		const grid = document.querySelector<HTMLElement>('[role="grid"]')!;
		const [, groupHeader] = getHeaderCells(grid);

		groupHeader.focus();
		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');

		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:descending');

		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');
	});

	it('keeps vertical navigation aligned with DOM order after sorting', async () => {
		render(TableTest);
		const grid = document.querySelector<HTMLElement>('[role="grid"]')!;
		const [, groupHeader] = getHeaderCells(grid);

		await groupHeader.click();
		await groupHeader.click();

		const groupCells = getBodySecondColumnCells(grid);
		const visibleOrder = groupCells.map((cell) => cell.textContent?.trim());

		groupHeader.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe(visibleOrder[0]);

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe(visibleOrder[1]);

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe(visibleOrder[2]);
	});

	it('renders the empty state when there are no body rows', async () => {
		render(TableTest, { rows: [] });
		const emptyCell = document.querySelector<HTMLElement>('tbody td[aria-disabled="true"]');
		expect(emptyCell?.textContent).toContain('No users found.');
		expect(document.querySelector('tbody tr[data-empty]')?.getAttribute('role')).toBe('row');
	});

	it('does not render the empty state alongside body rows', async () => {
		render(TableTest);
		expect(document.querySelector('tbody [data-empty]')).toBeNull();
	});

	it('prevents selection on disabled rows', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			disabledKeys: ['zahra']
		});
		const secondBodyFirstColumn = getBodyFirstColumnCells(document.body)[1];
		await secondBodyFirstColumn.click();

		expect(document.querySelector('[data-testid="selected-keys"]')?.textContent).not.toContain(
			'zahra'
		);
		expect(document.querySelectorAll('tbody tr')[1]?.getAttribute('data-disabled')).toBe('true');
	});

	it('does not make disabled body cells focusable', async () => {
		render(TableTest, {
			disabledKeys: ['zahra']
		});

		const disabledRowCells = Array.from(
			document.querySelectorAll<HTMLElement>('tbody tr')[1].children
		);
		for (const cell of disabledRowCells) {
			expect(cell.getAttribute('tabindex')).toBeNull();
		}
	});

	it('marks disabled body cells with aria-disabled', async () => {
		render(TableTest, {
			disabledKeys: ['zahra']
		});

		const disabledRowCells = Array.from(
			document.querySelectorAll<HTMLElement>('tbody tr')[1].children
		);

		expect(disabledRowCells).toHaveLength(2);
		for (const cell of disabledRowCells) {
			expect(cell.getAttribute('aria-disabled')).toBe('true');
		}
	});

	it('skips disabled rows when arrow-navigating in replace mode', async () => {
		render(TableTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace',
			disabledKeys: ['zahra']
		});
		const firstBodyCell = getBodyFirstColumnCells(document.body)[0];

		await userEvent.click(firstBodyCell);
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo"]');

		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('jasper@example.com');
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["jasper"]');
	});

	it('does not serialize false focus attributes during keyboard navigation', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid').element() as HTMLElement;
		const [emailHeader] = getHeaderCells(grid);

		emailHeader.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowRight}');

		expectNoFalseFocusAttributes(grid);
	});

	it('does not inject inline outline styles into cells or header cells', async () => {
		render(TableTest);
		const headerCell = document.querySelector<HTMLElement>('thead [role="columnheader"]')!;
		const bodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		headerCell.focus();
		bodyCell.focus();

		const headerStyle = headerCell.getAttribute('style') ?? '';
		const bodyStyle = bodyCell.getAttribute('style') ?? '';
		expect(headerStyle).not.toContain('outline');
		expect(bodyStyle).not.toContain('outline');
	});

	it('shows focus-visible only for keyboard navigation, not pointer clicks', async () => {
		render(TableTest);
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;

		await userEvent.click(firstBodyCell);
		expect(firstBodyCell.getAttribute('data-focused')).toBe('true');
		expect(firstBodyCell.getAttribute('data-focus-visible')).toBeNull();

		await userEvent.keyboard('{ArrowRight}');

		const secondBodyCell = document.activeElement as HTMLElement;
		expect(secondBodyCell.getAttribute('data-focused')).toBe('true');
		expect(secondBodyCell.getAttribute('data-focus-visible')).toBe('true');
	});

	it('clears header focus-visible when a pointer click takes over from keyboard navigation', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid').element() as HTMLElement;
		const [emailHeader, groupHeader] = getHeaderCells(grid);

		emailHeader.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => groupHeader.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.click(groupHeader);

		await expect.poll(() => document.activeElement).toBe(groupHeader);
		expect(groupHeader.getAttribute('data-focused')).toBe('true');
		expect(groupHeader.getAttribute('data-focus-visible')).toBeNull();
	});

	it('marks focused rows with focus-within semantics instead of row-focused semantics', async () => {
		render(TableTest);
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;
		const firstRow = document.querySelector<HTMLElement>('tbody tr')!;

		firstBodyCell.focus();

		await expect.poll(() => firstRow.getAttribute('data-focus-within')).toBe('true');
		expect(firstRow.getAttribute('data-focused')).toBeNull();

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => firstRow.getAttribute('data-focus-visible-within')).toBe('true');
		expect(firstRow.getAttribute('data-focus-visible')).toBeNull();
	});

	it('clears focused cell state when focus leaves the table', async () => {
		render(TableTest);
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;
		const firstRow = document.querySelector<HTMLElement>('tbody tr')!;
		const outsideButton = document.createElement('button');
		outsideButton.textContent = 'Outside';
		document.body.appendChild(outsideButton);

		try {
			firstBodyCell.focus();
			await expect.poll(() => firstBodyCell.getAttribute('data-focused')).toBe('true');
			await expect.poll(() => firstRow.getAttribute('data-focus-within')).toBe('true');

			outsideButton.focus();

			await expect.poll(() => firstBodyCell.getAttribute('data-focused')).toBeNull();
			await expect.poll(() => firstRow.getAttribute('data-focus-within')).toBeNull();
		} finally {
			outsideButton.remove();
		}
	});

	it('supports Ctrl+A for multiple row selection', async () => {
		render(TableTest, { selectionMode: 'multiple' });
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]');
		firstBodyCell?.focus();

		await userEvent.keyboard('{Control>}a{/Control}');

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toContain('jasper');
	});

	it('renders body value cells as gridcells', async () => {
		render(TableTest);
		expect(
			getBodySecondColumnCells(document.body).map((cell) => cell.textContent?.trim())
		).toContain('Admin');
	});
});
