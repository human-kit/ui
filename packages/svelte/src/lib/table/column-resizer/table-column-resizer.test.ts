import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ColumnResizerTest from './table-column-resizer-test.svelte';
import ColumnResizerFreezeLayoutTest from './table-column-resizer-freeze-layout-test.svelte';

function readColumnWidths() {
	const text = document.querySelector('[data-testid="column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as Record<string, number>;
}

function readFrozenColumnWidths() {
	const text = document.querySelector('[data-testid="freeze-column-widths"]')?.textContent ?? '{}';
	return JSON.parse(text) as Record<string, number>;
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
		await userEvent.keyboard('{ArrowRight}');

		await expect.poll(() => readColumnWidths().email).toBe(216);
		expect(readColumnWidths().group).toBe(160);
	});

	it('does not trigger sorting when interacting with the resize handle', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		await userEvent.click(groupResizer);

		await expect
			.poll(() => document.querySelector('[data-testid="sort-descriptor"]')?.textContent)
			.toBe('');
	});

	it('updates width on pointer drag and respects max width constraints', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;

		groupResizer.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100 })
		);
		window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 240 }));
		window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 240 }));

		await expect.poll(() => readColumnWidths().group).toBe(260);
	});

	it('suppresses the residual header click after a drag resize ends', async () => {
		render(ColumnResizerTest);
		const groupResizer = document.querySelector<HTMLElement>('[data-testid="group-resizer"]')!;
		const groupHeader = groupResizer.closest('th') as HTMLElement;

		groupResizer.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100 })
		);
		window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 140 }));
		window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 140 }));

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
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="freeze-email-resizer"]')!;

		emailResizer.dispatchEvent(
			new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 160 })
		);

		await expect.poll(() => Object.keys(readFrozenColumnWidths()).sort()).toEqual([
			'email',
			'group'
		]);
	});

	it('anchors the resize handle to the header cell edge', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;
		const emailHeaderCell = emailResizer.closest('th') as HTMLElement;
		const headerContent = emailHeaderCell.querySelector<HTMLElement>('[data-table-header-content]');

		expect(emailHeaderCell.style.position).toBe('relative');
		expect(emailHeaderCell.style.overflow).toBe('visible');
		expect(headerContent?.style.overflow).toBe('hidden');
		expect(emailResizer.style.position).toBe('absolute');
		expect(emailResizer.style.right).toBe('0px');
		expect(emailResizer.style.transform).toBe('translateX(50%)');
		expect(emailResizer.style.width).toBe('0.75rem');
		expect(emailResizer.style.height).toBe('100%');
	});

	it('uses table-layout: fixed so resizing is column-isolated', async () => {
		render(ColumnResizerTest);
		const table = document.querySelector<HTMLTableElement>('table[role="grid"]')!;
		expect(table.style.tableLayout).toBe('fixed');
	});

	it('resizing one column does not change the width of its sibling', async () => {
		render(ColumnResizerTest);
		const emailResizer = document.querySelector<HTMLElement>('[data-testid="email-resizer"]')!;

		const groupBefore = readColumnWidths().group;

		emailResizer.focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');

		await expect.poll(() => readColumnWidths().email).toBe(200 + 16 * 3);
		expect(readColumnWidths().group).toBe(groupBefore);
	});
});