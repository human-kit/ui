import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { distributeRoundedWidths, type TableColumnWidth } from '../root/context';
import ColumnResizerTest from './table-column-resizer-test.svelte';
import ColumnResizerFixedWidthTest from './table-column-resizer-fixed-width-test.svelte';
import ColumnResizerFreezeLayoutTest from './table-column-resizer-freeze-layout-test.svelte';
import ColumnResizerOverflowTest from './table-column-resizer-overflow-test.svelte';
import ColumnResizerPaddedContainerTest from './table-column-resizer-padded-container-test.svelte';
import ColumnResizerSandboxOverflowTest from './table-column-resizer-sandbox-overflow-test.svelte';
import ColumnResizerThreeColumnRelativeTest from './table-column-resizer-three-column-relative-test.svelte';
import ColumnResizerSelectionColumnTest from './table-column-resizer-selection-column-test.svelte';

type ColumnWidthState = Record<string, TableColumnWidth>;

function readColumnWidths() {
	const text = document.querySelector('[data-testid="column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
}

function readFrozenColumnWidths() {
	const text = document.querySelector('[data-testid="freeze-column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
}

function readOverflowColumnWidths() {
	const text =
		document.querySelector('[data-testid="overflow-column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
}

function readThreeColumnRelativeWidths() {
	const text =
		document.querySelector('[data-testid="three-column-relative-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
}

function readPaddedRelativeWidths() {
	const text =
		document.querySelector('[data-testid="padded-relative-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
}

function readSandboxOverflowWidths() {
	const text =
		document.querySelector('[data-testid="sandbox-overflow-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
}

function readNumericWidth(width: TableColumnWidth | undefined) {
	if (typeof width === 'number') return width;
	if (typeof width === 'string' && width.trim().endsWith('px')) {
		const parsed = Number.parseFloat(width);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}

function readResizeEndWidths() {
	const text = document.querySelector('[data-testid="resize-end-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as ColumnWidthState;
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
		const resizeStatus = emailResizer?.querySelector<HTMLElement>(
			'[data-testid="column-resize-status"]'
		);

		await expect.element(emailResizer).toHaveAttribute('role', 'separator');
		await expect.element(emailResizer).toHaveAttribute('tabindex', '0');
		expect(emailTh?.style.width).toBe('200px');
		expect(resizeStatus?.style.position).toBe('fixed');
		expect(resizeStatus?.style.top).toBe('0px');
		expect(resizeStatus?.style.left).toBe('0px');
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

	it('treats width as a fixed column width while still exposing the resize handle affordance', async () => {
		render(ColumnResizerFixedWidthTest);
		const fixedResizer = document.querySelector<HTMLElement>(
			'[data-testid="fixed-email-resizer"]'
		)!;
		const fixedHeader = fixedResizer.closest('th') as HTMLElement;

		await expect.poll(() => fixedHeader.style.width).toBe('220px');
		await expect.element(fixedResizer).toHaveAttribute('role', 'separator');
		await expect.element(fixedResizer).toHaveAttribute('tabindex', '0');
		expect(fixedResizer.style.pointerEvents).toBe('auto');

		fixedResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 100,
				pointerId: 21,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 180,
				pointerId: 21,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 180,
				pointerId: 21,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.element(fixedResizer).not.toHaveAttribute('data-resizing');

		await expect.poll(() => fixedHeader.style.width).toBe('220px');
		expect(readColumnWidths().email).toBeUndefined();
		expect(readColumnWidths().role).toBeUndefined();

		window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
	});

	it('keeps defaultWidth columns resizable as uncontrolled initial widths', async () => {
		render(ColumnResizerFixedWidthTest);
		const roleResizer = document.querySelector<HTMLElement>('[data-testid="role-resizer"]')!;
		const roleHeader = roleResizer.closest('th') as HTMLElement;

		await expect.poll(() => roleHeader.style.width).toBe('180px');
		await expect.element(roleResizer).toHaveAttribute('role', 'separator');
		await expect.element(roleResizer).toHaveAttribute('tabindex', '0');

		roleResizer.focus();
		await userEvent.keyboard('{Enter}');
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => readColumnWidths().role).toBe(196);
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

	it('does not materialize relative widths on pointerdown without an actual drag', async () => {
		render(ColumnResizerFreezeLayoutTest);
		const emailResizer = document.querySelector<HTMLElement>(
			'[data-testid="freeze-email-resizer"]'
		)!;

		emailResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 160,
				pointerId: 31,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				button: 0,
				clientX: 160,
				pointerId: 31,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		expect(readFrozenColumnWidths()).toEqual({});
	});

	it('does not resize the flexible tail when clicking a handle without dragging in a relative layout', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		const planBeforeClick = Math.round(planHeaderCell.getBoundingClientRect().width);

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 36,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 36,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		expect(readThreeColumnRelativeWidths()).toEqual({});
		expect(Math.round(planHeaderCell.getBoundingClientRect().width)).toBe(planBeforeClick);
	});

	it('recomputes a trailing relative column when the container width changes without dragging', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const container = document.querySelector<HTMLElement>(
			'[data-testid="three-column-relative-container"]'
		)!;
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		const initialTableWidth = Math.round(table.getBoundingClientRect().width);
		const initialPlanWidth = Math.round(planHeaderCell.getBoundingClientRect().width);

		container.style.width = '760px';
		window.dispatchEvent(new Event('resize'));

		await expect
			.poll(() => Math.round(table.getBoundingClientRect().width))
			.toBeGreaterThan(initialTableWidth);
		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBeGreaterThan(initialPlanWidth);
	});

	it('recomputes relative widths when a resize event changes the measured container width', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const container = document.querySelector<HTMLElement>(
			'[data-testid="three-column-relative-container"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;
		const initialPlanWidth = Math.round(planHeaderCell.getBoundingClientRect().width);
		let mockedClientWidth = container.clientWidth;

		Object.defineProperty(container, 'clientWidth', {
			configurable: true,
			get() {
				return mockedClientWidth;
			}
		});

		try {
			mockedClientWidth = initialPlanWidth + 520;
			window.dispatchEvent(new Event('resize'));

			await expect
				.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
				.toBeGreaterThan(initialPlanWidth);
		} finally {
			Reflect.deleteProperty(container, 'clientWidth');
		}
	});

	it('recomputes the restored flexible tail on resize after a prior drag session', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const container = document.querySelector<HTMLElement>(
			'[data-testid="three-column-relative-container"]'
		)!;
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 141,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 320,
				pointerId: 141,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 320,
				pointerId: 141,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().plan).toBe('1fr');
		const planWidthAfterDrag = Math.round(planHeaderCell.getBoundingClientRect().width);
		let mockedClientWidth = container.clientWidth;

		Object.defineProperty(container, 'clientWidth', {
			configurable: true,
			get() {
				return mockedClientWidth;
			}
		});

		try {
			mockedClientWidth += 120;
			window.dispatchEvent(new Event('resize'));

			await expect
				.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
				.toBeGreaterThan(planWidthAfterDrag);
		} finally {
			Reflect.deleteProperty(container, 'clientWidth');
		}
	});

	it('ignores a zero-delta pointermove so relative widths do not materialize accidentally', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		const planBeforePointerNoise = Math.round(planHeaderCell.getBoundingClientRect().width);

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 37,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 240,
				pointerId: 37,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 37,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		expect(readThreeColumnRelativeWidths()).toEqual({});
		expect(Math.round(planHeaderCell.getBoundingClientRect().width)).toBe(planBeforePointerNoise);
	});

	it('freezes the implicit flexible tail into px widths when a drag first changes width', async () => {
		render(ColumnResizerFreezeLayoutTest);
		const emailResizer = document.querySelector<HTMLElement>(
			'[data-testid="freeze-email-resizer"]'
		)!;
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;

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
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 220,
				pointerId: 3,
				pointerType: 'touch',
				isPrimary: true
			})
		);

		await expect
			.poll(() => Object.keys(readFrozenColumnWidths()).sort())
			.toEqual(['email', 'group']);
		await expect.poll(() => typeof readFrozenColumnWidths().group).toBe('number');
		await expect.poll(() => typeof readFrozenColumnWidths().email).toBe('number');
		await expect
			.poll(() => Math.round(table.getBoundingClientRect().width))
			.toBeGreaterThanOrEqual(640);
	});

	it('anchors the resize handle to the header cell edge', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;
		const emailHeaderCell = emailResizer.closest('th') as HTMLElement;

		await expect.poll(() => getComputedStyle(emailHeaderCell).position).toBe('relative');
		expect(emailHeaderCell.style.overflow).toBe('visible');
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
		const emailHeaderCell = emailResizer.closest('th') as HTMLElement;

		await expect
			.poll(() => {
				const rect = emailHeaderCell.getBoundingClientRect();
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

	it('keeps growing the resized column after the flexible tail hits its implicit minimum', async () => {
		render(ColumnResizerOverflowTest);
		const regionResizer = document.querySelector<HTMLElement>(
			'[data-testid="overflow-region-resizer"]'
		)!;
		const nameHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="overflow-name-header-cell"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="overflow-plan-header-cell"]'
		)!;
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;

		regionResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 320,
				pointerId: 51,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 480,
				pointerId: 51,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readOverflowColumnWidths().region as number).toBeTypeOf('number');
		const firstRegionWidth = readOverflowColumnWidths().region as number;

		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 760,
				pointerId: 51,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect
			.poll(() => readOverflowColumnWidths().region as number)
			.toBeGreaterThan(firstRegionWidth);
		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBeLessThanOrEqual(68);
		expect(Math.round(planHeaderCell.getBoundingClientRect().width)).toBeGreaterThanOrEqual(60);
		await expect.poll(() => nameHeaderCell.style.width).toBe('240px');
		await expect.poll(() => Math.round(table.getBoundingClientRect().width)).toBeGreaterThan(640);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 760,
				pointerId: 51,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
	});

	it('does not make region lose pixels when name grows from the implicit layout', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const regionHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-header-cell"]'
		)!;

		const regionBefore = Math.round(regionHeaderCell.getBoundingClientRect().width);

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 71,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 241,
				pointerId: 71,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 241,
				pointerId: 71,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().region).toBe(180);
		await expect
			.poll(() => Math.round(regionHeaderCell.getBoundingClientRect().width))
			.toBe(regionBefore);
	});

	it('keeps implicit relative columns in relative CSS until the first resize starts', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-header-cell"]'
		)!;
		const regionHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-header-cell"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		await expect.poll(() => readThreeColumnRelativeWidths()).toEqual({});
		await expect.poll(() => regionHeaderCell.style.width).toBe('180px');
		await expect.poll(() => nameHeaderCell.style.width.includes('calc(')).toBe(true);
		await expect.poll(() => planHeaderCell.style.width.includes('calc(')).toBe(true);
	});

	it('restores the trailing flexible tail after one drag so a later sibling drag still treats it as flexible', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const regionResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-resizer"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 81,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 280,
				pointerId: 81,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 280,
				pointerId: 81,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().plan).toBe('1fr');

		const planBeforeRegionDrag = Math.round(planHeaderCell.getBoundingClientRect().width);

		regionResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 320,
				pointerId: 82,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 380,
				pointerId: 82,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBeLessThan(planBeforeRegionDrag);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 380,
				pointerId: 82,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().plan).toBe('1fr');
	});

	it('does not let the flexible tail grow disproportionately on a second drag after resizing a sibling first', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const regionResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-resizer"]'
		)!;
		const regionHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-header-cell"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 91,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 300,
				pointerId: 91,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 300,
				pointerId: 91,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		const planBeforeSecondDrag = Math.round(planHeaderCell.getBoundingClientRect().width);
		const regionBeforeSecondDrag = Math.round(regionHeaderCell.getBoundingClientRect().width);

		regionResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 320,
				pointerId: 92,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 320,
				pointerId: 92,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		expect(readThreeColumnRelativeWidths().plan).toBe('1fr');
		expect(Math.round(planHeaderCell.getBoundingClientRect().width)).toBe(planBeforeSecondDrag);

		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 350,
				pointerId: 92,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect
			.poll(() => Math.round(regionHeaderCell.getBoundingClientRect().width))
			.toBeGreaterThan(regionBeforeSecondDrag);
		const regionAfterSecondDrag = Math.round(regionHeaderCell.getBoundingClientRect().width);
		const planAfterSecondDrag = Math.round(planHeaderCell.getBoundingClientRect().width);

		expect(regionAfterSecondDrag - regionBeforeSecondDrag).toBeLessThanOrEqual(40);
		expect(planAfterSecondDrag - planBeforeSecondDrag).toBeLessThanOrEqual(10);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 350,
				pointerId: 92,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
	});

	it('re-materializes widths when resizing a px-managed column after the flexible tail was restored', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const regionResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-resizer"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 101,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 251,
				pointerId: 101,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 251,
				pointerId: 101,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().plan).toBe('1fr');
		const planBeforeRegionDrag = Math.round(planHeaderCell.getBoundingClientRect().width);

		regionResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 320,
				pointerId: 102,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 325,
				pointerId: 102,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => typeof readThreeColumnRelativeWidths().plan).toBe('number');
		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBeLessThan(planBeforeRegionDrag);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 325,
				pointerId: 102,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().plan).toBe('1fr');
	});

	it('does not expand the flexible tail when releasing a drag inside a padded container', async () => {
		render(ColumnResizerPaddedContainerTest);
		const nameResizer = document.querySelector<HTMLElement>('[data-testid="padded-name-resizer"]')!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="padded-plan-header-cell"]'
		)!;

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 111,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 260,
				pointerId: 111,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => typeof readPaddedRelativeWidths().plan).toBe('number');
		const planWidthDuringDrag = Math.round(planHeaderCell.getBoundingClientRect().width);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 260,
				pointerId: 111,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readPaddedRelativeWidths().plan).toBe('1fr');
		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBe(planWidthDuringDrag);
	});

	it('shrinking an overflowed column in a new drag session removes overflow before pointerup', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const nameResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-resizer"]'
		)!;
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;
		const container = document.querySelector<HTMLElement>(
			'[data-testid="three-column-relative-container"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 240,
				pointerId: 121,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 480,
				pointerId: 121,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 480,
				pointerId: 121,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		const overflowedTableWidth = Math.round(table.getBoundingClientRect().width);
		const containerWidth = Math.round(container.getBoundingClientRect().width);
		expect(overflowedTableWidth).toBeGreaterThan(containerWidth);

		nameResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 480,
				pointerId: 122,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 360,
				pointerId: 122,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect
			.poll(() => {
				const widths = readThreeColumnRelativeWidths();
				return Number(widths.name) + Number(widths.region) + Number(widths.plan);
			})
			.toBeLessThanOrEqual(640);
		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBeGreaterThanOrEqual(60);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 360,
				pointerId: 122,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
	});

	it('removes overflow mid-drag in the sandbox-like layout after releasing an overflowed resize', async () => {
		render(ColumnResizerSandboxOverflowTest);
		const requestResizer = document.querySelector<HTMLElement>(
			'[data-testid="sandbox-request-resizer"]'
		)!;
		const container = document.querySelector<HTMLElement>(
			'[data-testid="sandbox-overflow-container"]'
		)!;
		const totalHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="sandbox-total-header-cell"]'
		)!;

		requestResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 320,
				pointerId: 131,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 640,
				pointerId: 131,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 640,
				pointerId: 131,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => Number(readSandboxOverflowWidths().request)).toBeGreaterThan(350);
		await expect
			.poll(() => {
				const widths = readSandboxOverflowWidths();
				return (
					44 +
					readNumericWidth(widths.request) +
					readNumericWidth(widths.requester) +
					readNumericWidth(widths.area) +
					readNumericWidth(widths.status) +
					readNumericWidth(widths.priority) +
					readNumericWidth(widths.total)
				);
			})
			.toBeGreaterThan(Math.round(container.getBoundingClientRect().width));

		requestResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 640,
				pointerId: 132,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 280,
				pointerId: 132,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect
			.poll(() => {
				const widths = readSandboxOverflowWidths();
				return (
					44 +
					readNumericWidth(widths.request) +
					readNumericWidth(widths.requester) +
					readNumericWidth(widths.area) +
					readNumericWidth(widths.status) +
					readNumericWidth(widths.priority) +
					readNumericWidth(widths.total)
				);
			})
			.toBeLessThanOrEqual(Math.round(container.getBoundingClientRect().width));
		await expect
			.poll(() => Math.round(totalHeaderCell.getBoundingClientRect().width))
			.toBeGreaterThan(60);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 280,
				pointerId: 132,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
	});

	it('distributes the leftover pixel across relative columns when rounding would otherwise lose it', () => {
		const entries = distributeRoundedWidths(
			[
				{
					columnId: 'left',
					index: 0,
					exactWidth: 226.5,
					width: 227,
					minWidth: 60,
					maxWidth: undefined,
					remainder: 0.5
				},
				{
					columnId: 'right',
					index: 1,
					exactWidth: 226.5,
					width: 227,
					minWidth: 60,
					maxWidth: undefined,
					remainder: 0.5
				}
			],
			453
		);

		expect(entries.map((entry) => entry.width).sort((left, right) => left - right)).toEqual([
			226, 227
		]);
		expect(entries.reduce((total, entry) => total + entry.width, 0)).toBe(453);
	});

	it('does not make name shrink after region exhausts the flexible tail', async () => {
		render(ColumnResizerThreeColumnRelativeTest);
		const regionResizer = document.querySelector<HTMLElement>(
			'[data-testid="three-column-region-resizer"]'
		)!;
		const nameHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-name-header-cell"]'
		)!;
		const planHeaderCell = document.querySelector<HTMLElement>(
			'[data-testid="three-column-plan-header-cell"]'
		)!;
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;
		const container = document.querySelector<HTMLElement>(
			'[data-testid="three-column-relative-container"]'
		)!;

		regionResizer.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: 320,
				pointerId: 72,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 520,
				pointerId: 72,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect.poll(() => readThreeColumnRelativeWidths().name).toBeTypeOf('number');
		const frozenNameWidth = Math.round(nameHeaderCell.getBoundingClientRect().width);

		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 760,
				pointerId: 72,
				pointerType: 'mouse',
				isPrimary: true
			})
		);

		await expect
			.poll(() => Math.round(nameHeaderCell.getBoundingClientRect().width))
			.toBe(frozenNameWidth);
		await expect
			.poll(() => Math.round(planHeaderCell.getBoundingClientRect().width))
			.toBeLessThanOrEqual(68);
		expect(Math.round(planHeaderCell.getBoundingClientRect().width)).toBeGreaterThanOrEqual(60);
		await expect.poll(() => Math.round(table.getBoundingClientRect().width)).toBeGreaterThan(640);
		expect(container.scrollWidth).toBeGreaterThan(container.clientWidth);

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 760,
				pointerId: 72,
				pointerType: 'mouse',
				isPrimary: true
			})
		);
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
