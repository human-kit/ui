import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ColumnResizerTest from './table-column-resizer-test.svelte';
import ColumnResizerFreezeLayoutTest from './table-column-resizer-freeze-layout-test.svelte';
import ColumnResizerSelectionColumnTest from './table-column-resizer-selection-column-test.svelte';

function readColumnWidths() {
	const text = document.querySelector('[data-testid="column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as Record<string, number>;
}

function readFrozenColumnWidths() {
	const text = document.querySelector('[data-testid="freeze-column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as Record<string, number>;
}

function readResizeEndWidths() {
	const text = document.querySelector('[data-testid="resize-end-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as Record<string, number>;
}

function readResizeAnnouncement(testId: string) {
	const resizer = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	return resizer?.querySelector('[data-testid="column-resize-status"]')?.textContent?.trim() ?? '';
}

describe('Table.ColumnResizer', () => {
	it('renders a focusable separator and applies controlled widths on header cells', async () => {
		render(ColumnResizerTest);

		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]');
		const emailTh = emailResizer?.closest('th');

		await expect.element(emailResizer).toHaveAttribute('role', 'separator');
		await expect.element(emailResizer).toHaveAttribute('tabindex', '0');
		expect(emailTh?.style.width).toBe('200px');
	});

	it('resizes only the active column with keyboard input', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(emailResizer).toHaveAttribute('data-resizing', 'true');
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => readColumnWidths().email).toBe(216);
		expect(readColumnWidths().group).toBe(160);
		await expect.element(emailResizer).not.toHaveAttribute('data-resizing');
		await expect
			.poll(() => document.querySelector('[data-testid="resize-start-column"]')?.textContent)
			.toBe('email');
		await expect.poll(() => readResizeEndWidths().email).toBe(216);
		await expect.poll(() => readResizeAnnouncement('email-resizer')).toBe('Email width 216px.');
	});

	it('does not resize from arrow keys until keyboard resize mode is activated', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.focus();
		await userEvent.keyboard('{ArrowRight}');

		expect(readColumnWidths().email).toBe(200);
		await expect.element(emailResizer).not.toHaveAttribute('data-resizing');
	});

	it('does not trigger sorting when interacting with the resize handle', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		await userEvent.click(groupResizer);

		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('');
	});

	it('moves focus onto the resize handle after pointer interaction so arrow keys work immediately', async () => {
		const screen = render(ColumnResizerTest);
		const emailResizer = screen.getByTestId('email-resizer').element() as HTMLElement;
		const groupHeaderCell = screen.getByTestId('group-header-cell').element() as HTMLElement;

		emailResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 41,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 41,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => document.activeElement).toBe(emailResizer);

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(groupHeaderCell);
	});

	it('updates width on pointer drag and respects max width constraints', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		groupResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 1,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 240,
				pointerId: 1,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 240,
				pointerId: 1,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readColumnWidths().group).toBe(260);
		await expect.poll(() => readResizeAnnouncement('group-resizer')).toBe('Group width 260px.');
	});

	it('cancels an in-progress pointer resize with Escape', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		groupResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 11,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 220,
				pointerId: 11,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readColumnWidths().group).toBe(260);

		window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));

		await expect.poll(() => readColumnWidths().group).toBe(160);
		await expect.poll(() => readResizeEndWidths().group).toBe(160);
		expect(readResizeAnnouncement('group-resizer')).toBe('');
	});

	it('suppresses the residual header click after a drag resize ends', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;
		const groupHeader = groupResizer.closest('th') as HTMLElement;

		groupResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 2,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 140,
				pointerId: 2,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 140,
				pointerId: 2,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		groupHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(document.querySelector('[data-testid="sort-descriptor"]')?.textContent).toBe('');

		groupHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('group:ascending');
	});

	it('auto fits the column to the widest content on double click', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, button: 0 }));

		await expect.poll(() => readColumnWidths().email).toBeGreaterThan(200);
	});

	it('shrinks a wide column to its intrinsic content width on double click', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		groupResizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, button: 0 }));

		await expect.poll(() => readColumnWidths().group).toBeLessThan(160);
	});

	it('prioritizes auto fit on the second press of a double click instead of starting a drag', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		groupResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 12,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 12,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		expect(readColumnWidths().group).toBe(160);

		groupResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 12,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readColumnWidths().group).toBeLessThan(160);

		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 240,
				pointerId: 12,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 240,
				pointerId: 12,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		expect(readColumnWidths().group).not.toBe(260);
		expect(readColumnWidths().group).toBeLessThan(160);
	});

	it('does not keep changing width after the column is already auto fitted', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, button: 0 }));
		await expect.poll(() => readColumnWidths().email).toBeGreaterThan(200);
		const fittedWidth = readColumnWidths().email;

		emailResizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, button: 0 }));

		await expect.poll(() => readColumnWidths().email).toBe(fittedWidth);
	});

	it('freezes measured widths for all columns when a drag starts', async () => {
		render(ColumnResizerFreezeLayoutTest);
		const emailResizer = document.querySelector<HTMLElement>(
			'[data-testid="freeze-email-resizer"]'
		)!;

		emailResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 160,
				pointerId: 3,
				pointerType: 'touch',
				isPrimary: true
			})
		);

		await expect
			.poll(() => Object.keys(readFrozenColumnWidths()).sort())
			.toEqual(['email', 'group']);
	});

	it('anchors the resize handle to the header cell edge', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;
		const emailHeaderCell = emailResizer.closest('th') as HTMLElement;
		const headerContent = emailHeaderCell.querySelector<HTMLElement>('[data-table-header-content]');

		await expect.poll(() => getComputedStyle(headerContent!).position).toBe('relative');
		expect(headerContent?.style.overflow).toBe('visible');
		expect(emailResizer.style.position).toBe('absolute');
		expect(emailResizer.style.zIndex).toBe('2');
		expect(emailResizer.style.right).toBe('0px');
		expect(emailResizer.style.transform).toBe('translateX(50%)');
		expect(emailResizer.style.width).toBe('0.75rem');
		expect(emailResizer.style.height).toBe('100%');
	});

	it('keeps the overflow hit area reachable from the adjacent header cell side', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;
		const headerContent = emailResizer.closest('[data-table-header-content]') as HTMLElement;

		await expect
			.poll(() => {
				const rect = headerContent.getBoundingClientRect();
				const hitTarget = document.elementFromPoint(rect.right + 2, rect.top + rect.height / 2);
				return hitTarget?.getAttribute('data-testid') ?? null;
			})
			.toBe('email-resizer');
	});

	it('uses table-layout: fixed so resizing is column-isolated', async () => {
		render(ColumnResizerTest);
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;
		expect(table.style.tableLayout).toBe('fixed');
	});

	it('resizing one column does not change the width of its sibling', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.focus();
		await userEvent.keyboard('{Enter}{ArrowRight}');
		const groupAfterFirstResize = readColumnWidths().group;

		await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}');

		await expect.poll(() => readColumnWidths().email).toBe(200 + 16 * 3);
		expect(readColumnWidths().group).toBe(groupAfterFirstResize);
	});

	it('keeps a fixed-width selection column stable while resizing a sibling column', async () => {
		render(ColumnResizerSelectionColumnTest);
		const emailResizer = document.querySelector<HTMLElement>(
			'[data-testid="selection-email-resizer"]'
		)!;
		const selectionHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="selection-header-cell"]'
		)!;
		const initialSelectionWidth = Math.round(selectionHeaderCell.getBoundingClientRect().width);

		emailResizer.focus();
		await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}');

		await expect
			.poll(() => Math.round(selectionHeaderCell.getBoundingClientRect().width))
			.toBe(initialSelectionWidth);
	});

	it('respects shift-step and Home keyboard resizing', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		groupResizer.focus();
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
		await expect.poll(() => readColumnWidths().group).toBe(208);

		await userEvent.keyboard('{Home}');
		await expect.poll(() => readColumnWidths().group).toBe(100);
		await userEvent.keyboard('{Enter}');
	});

	it('auto fits the column from End while keyboard resize mode is active', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.focus();
		await userEvent.keyboard('{Enter}{Home}');
		await expect.poll(() => readColumnWidths().email).toBe(120);

		await userEvent.keyboard('{End}');
		await expect.poll(() => readColumnWidths().email).toBeGreaterThan(200);
		await userEvent.keyboard('{Enter}');
	});

	it('inverts ArrowLeft and ArrowRight resizing in RTL layouts', async () => {
		const previousDir = document.documentElement.dir;
		document.documentElement.dir = 'rtl';

		try {
			const screen = render(ColumnResizerTest);
			const emailResizer = screen.getByTestId('email-resizer').element() as HTMLElement;

			emailResizer.focus();
			await userEvent.keyboard('{Enter}{ArrowRight}');
			await expect.poll(() => readColumnWidths().email).toBe(184);

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => readColumnWidths().email).toBe(200);
			await userEvent.keyboard('{Enter}');
		} finally {
			document.documentElement.dir = previousDir;
		}
	});

	it('updates separator value attributes after resize', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		emailResizer.focus();
		await userEvent.keyboard('{Enter}{ArrowRight}{Enter}');

		await expect.element(emailResizer).toHaveAttribute('aria-valuenow', '216');
		await expect.element(emailResizer).toHaveAttribute('aria-valuetext', '216px wide');
	});

	it('moves focus from a header cell into its resize handle before the next header cell', async () => {
		const screen = render(ColumnResizerTest);
		const emailHeaderCell = screen.getByTestId('email-header-cell').element() as HTMLElement;
		const emailResizer = screen.getByTestId('email-resizer').element() as HTMLElement;
		const groupHeaderCell = screen.getByTestId('group-header-cell').element() as HTMLElement;

		emailHeaderCell.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(emailResizer);
		await expect.poll(() => emailHeaderCell.getAttribute('data-focused')).toBeNull();
		await expect.poll(() => emailHeaderCell.getAttribute('data-focus-visible')).toBeNull();
		await expect.poll(() => emailHeaderCell.getAttribute('data-focus-within')).toBe('true');
		await expect.poll(() => emailHeaderCell.getAttribute('data-focus-visible-within')).toBe('true');
		await expect.poll(() => emailResizer.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(groupHeaderCell);
	});

	it('moves focus back through the previous column resize handle before the previous header cell', async () => {
		const screen = render(ColumnResizerTest);
		const emailHeaderCell = screen.getByTestId('email-header-cell').element() as HTMLElement;
		const emailResizer = screen.getByTestId('email-resizer').element() as HTMLElement;
		const groupHeaderCell = screen.getByTestId('group-header-cell').element() as HTMLElement;

		groupHeaderCell.focus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.activeElement).toBe(emailResizer);

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.activeElement).toBe(emailHeaderCell);
	});

	it('keeps focus on the resize handle after exiting keyboard resize mode with Enter', async () => {
		const screen = render(ColumnResizerTest);
		const emailResizer = screen.getByTestId('email-resizer').element() as HTMLElement;
		const groupHeaderCell = screen.getByTestId('group-header-cell').element() as HTMLElement;

		emailResizer.focus();
		await userEvent.keyboard('{Enter}{ArrowRight}{Enter}');

		await expect.poll(() => document.activeElement).toBe(emailResizer);
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(groupHeaderCell);
	});

	it('restores the starting width when Escape cancels keyboard resize mode', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;
		const emailHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="email-header-cell"]'
		)!;

		emailResizer.focus();
		await userEvent.keyboard('{Enter}{ArrowRight}{Escape}');

		await expect.poll(() => readColumnWidths().email).toBe(200);
		await expect.poll(() => document.activeElement).toBe(emailHeaderCell);
		await expect.element(emailResizer).not.toHaveAttribute('data-resizing');
	});
});
