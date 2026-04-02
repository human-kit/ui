import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from './table-test.svelte';
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

	it('does not serialize false focus attributes during keyboard navigation', async () => {
		const screen = render(TableTest);
		const grid = screen.getByRole('grid').element() as HTMLElement;
		const [emailHeader] = getHeaderCells(grid);

		emailHeader.focus();
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowRight}');

		expectNoFalseFocusAttributes(grid);
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

	it('clears focused cell state when focus leaves the table', async () => {
		render(TableTest);
		const firstBodyCell = document.querySelector<HTMLElement>('tbody [role="rowheader"]')!;
		const outsideButton = document.createElement('button');
		outsideButton.textContent = 'Outside';
		document.body.appendChild(outsideButton);

		try {
			firstBodyCell.focus();
			await expect.poll(() => firstBodyCell.getAttribute('data-focused')).toBe('true');

			outsideButton.focus();

			await expect.poll(() => firstBodyCell.getAttribute('data-focused')).toBeNull();
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
