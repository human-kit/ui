import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TableTest from './table-test.svelte';

function getBodyRows() {
	return Array.from(document.querySelectorAll<HTMLElement>('tbody tr'));
}

function getBodyCells() {
	return Array.from(
		document.querySelectorAll<HTMLElement>('tbody [role="gridcell"], tbody [role="rowheader"]')
	);
}

function getFirstHeaderCell() {
	return document.querySelector<HTMLElement>('thead [role="columnheader"]')!;
}

describe('Table.Root keyboardNavigation', () => {
	it('defaults to grid navigation, where body cells are the focus targets', async () => {
		render(TableTest);

		expect(document.querySelector('[role="grid"]')?.getAttribute('data-keyboard-navigation')).toBe(
			'grid'
		);
		await expect
			.poll(() => getBodyCells().every((cell) => cell.hasAttribute('tabindex')))
			.toBe(true);
	});

	describe('row', () => {
		it('takes body cells out of the focus order and leaves the rows in it', async () => {
			render(TableTest, { keyboardNavigation: 'row' });

			await expect
				.poll(() => getBodyCells().some((cell) => cell.hasAttribute('tabindex')))
				.toBe(false);
			expect(getBodyRows().every((row) => row.hasAttribute('tabindex'))).toBe(true);
		});

		it('enters the body from the header and walks it row by row', async () => {
			render(TableTest, { keyboardNavigation: 'row' });
			const rows = getBodyRows();

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => document.activeElement).toBe(rows[0]);

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => document.activeElement).toBe(rows[1]);

			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(() => document.activeElement).toBe(rows[0]);
		});

		// A row spans every column, so there is nothing to the side of it. Without
		// this the horizontal keys would fall through to the cell path and focus a
		// cell that is not a focus target in this mode.
		it('ignores the horizontal keys inside the body', async () => {
			render(TableTest, { keyboardNavigation: 'row' });
			const rows = getBodyRows();

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => document.activeElement).toBe(rows[0]);

			await userEvent.keyboard('{ArrowRight}');
			await userEvent.keyboard('{ArrowLeft}');

			expect(document.activeElement).toBe(rows[0]);
		});

		it('leaves the body upwards, back into the header', async () => {
			render(TableTest, { keyboardNavigation: 'row' });

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowUp}');

			await expect.poll(() => document.activeElement).toBe(getFirstHeaderCell());
		});

		it('jumps to the first and last row with ctrl+Home / ctrl+End', async () => {
			render(TableTest, { keyboardNavigation: 'row' });
			const rows = getBodyRows();

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowDown}');

			await userEvent.keyboard('{Control>}{End}{/Control}');
			await expect.poll(() => document.activeElement).toBe(rows[rows.length - 1]);

			await userEvent.keyboard('{Control>}{Home}{/Control}');
			await expect.poll(() => document.activeElement).toBe(rows[0]);
		});

		it('still presses the focused row with Enter', async () => {
			const onRowAction = vi.fn();
			render(TableTest, { keyboardNavigation: 'row', onRowAction });

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => onRowAction.mock.calls.length).toBe(1);
			expect(onRowAction).toHaveBeenCalledWith('danilo');
		});

		it('still toggles the focused row with Space', async () => {
			render(TableTest, { keyboardNavigation: 'row', selectionMode: 'multiple' });

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard(' ');

			await expect
				.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
				.toBe('["danilo"]');
		});

		it('moves row focus on click, so the keyboard carries on from there', async () => {
			render(TableTest, { keyboardNavigation: 'row' });
			const rows = getBodyRows();

			await userEvent.click(rows[1].querySelector('td, th')!);

			await expect.poll(() => document.activeElement).toBe(rows[1]);
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => document.activeElement).toBe(rows[2]);
		});
	});

	describe('none', () => {
		it('leaves the whole body out of the focus order', async () => {
			render(TableTest, { keyboardNavigation: 'none' });

			await expect
				.poll(() => getBodyCells().some((cell) => cell.hasAttribute('tabindex')))
				.toBe(false);
			expect(getBodyRows().some((row) => row.hasAttribute('tabindex'))).toBe(false);
		});

		it('keeps the pointer working on rows', async () => {
			const onRowAction = vi.fn();
			render(TableTest, { keyboardNavigation: 'none', onRowAction });

			await userEvent.click(getBodyRows()[0].querySelector('td, th')!);

			await expect.poll(() => onRowAction.mock.calls.length).toBe(1);
		});

		it('keeps the header navigable, which is where sorting and resizing live', async () => {
			render(TableTest, { keyboardNavigation: 'none' });

			getFirstHeaderCell().focus();
			await userEvent.keyboard('{ArrowRight}');

			await expect.poll(() => document.activeElement?.textContent?.trim()).toContain('Group');
		});
	});

	it('registers and unregisters body cells as the mode changes at runtime', async () => {
		render(TableTest, { showKeyboardNavigationToggle: true });

		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="set-keyboard-navigation-row"]')!
		);
		await expect
			.poll(() => getBodyCells().some((cell) => cell.hasAttribute('tabindex')))
			.toBe(false);

		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="set-keyboard-navigation-grid"]')!
		);
		await expect
			.poll(() => getBodyCells().every((cell) => cell.hasAttribute('tabindex')))
			.toBe(true);

		// Back in grid mode the cells have to be navigable again, not merely
		// tabbable: that only holds if they re-registered with the focus registry.
		getFirstHeaderCell().focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement?.textContent?.trim()).toBe('danilo@example.com');
	});
});
