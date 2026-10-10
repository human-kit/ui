import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import SectionRowTest from './table-section-row-test.svelte';

function getSectionRow(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="section-${id}"]`)!;
}

function getSectionCell(id: string) {
	return getSectionRow(id).querySelector<HTMLElement>('td')!;
}

function getSelectedKeys() {
	return document.querySelector('[data-testid="selected-keys"]')?.textContent;
}

function createManyItems(groupCount: number, rowsPerGroup: number) {
	return Array.from({ length: groupCount }, (_, groupIndex) => [
		{
			id: `group-${groupIndex}`,
			kind: 'group' as const,
			label: `Group ${groupIndex}`,
			count: rowsPerGroup
		},
		...Array.from({ length: rowsPerGroup }, (_, rowIndex) => ({
			id: `user-${groupIndex}-${rowIndex}`,
			kind: 'user' as const,
			email: `user${groupIndex}-${rowIndex}@example.com`,
			group: `Group ${groupIndex}`
		}))
	]).flat();
}

describe('Table.SectionRow', () => {
	it('renders a single full-width cell that covers every column, the selection column included', async () => {
		render(SectionRowTest);

		const row = getSectionRow('group-developer');
		expect(row.getAttribute('role')).toBe('row');
		expect(row.hasAttribute('data-section-row')).toBe(true);
		const cells = row.querySelectorAll('td');
		expect(cells.length).toBe(1);
		expect(cells[0].getAttribute('role')).toBe('gridcell');
		await expect.poll(() => getSectionCell('group-developer').getAttribute('colspan')).toBe('3');
	});

	it('narrows its colspan to the visible columns', async () => {
		render(SectionRowTest, { hiddenColumns: ['group'] });

		await expect.poll(() => getSectionCell('group-developer').getAttribute('colspan')).toBe('2');
	});

	it('passes extra attributes through to the row', async () => {
		render(SectionRowTest);

		expect(getSectionRow('group-developer').getAttribute('aria-expanded')).toBe('true');
	});

	it('never renders a selection checkbox', async () => {
		render(SectionRowTest);

		expect(getSectionRow('group-developer').querySelector('[role="checkbox"]')).toBeNull();
		expect(getSectionRow('group-developer').hasAttribute('aria-selected')).toBe(false);
		expect(document.querySelector('[data-testid="row-checkbox-danilo"]')).toBeTruthy();
	});

	it('keeps section rows out of select-all and of the header checkbox state', async () => {
		render(SectionRowTest);
		const headerCheckbox = document.querySelector<HTMLElement>('[data-testid="header-checkbox"]')!;

		await userEvent.click(headerCheckbox);
		await expect.poll(getSelectedKeys).toBe('["danilo","jasper","zahra"]');
		await expect.poll(() => headerCheckbox.getAttribute('aria-checked')).toBe('true');

		await userEvent.click(headerCheckbox);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="row-checkbox-danilo"]')!
		);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="row-checkbox-jasper"]')!
		);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="row-checkbox-zahra"]')!
		);
		await expect.poll(getSelectedKeys).toBe('["danilo","jasper","zahra"]');
		await expect.poll(() => headerCheckbox.getAttribute('aria-checked')).toBe('true');
	});

	it('leaves a section row out of a shift range that crosses it', async () => {
		render(SectionRowTest);

		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="row-checkbox-jasper"]')!
		);
		document.querySelector<HTMLElement>('[data-testid="email-cell-jasper"]')!.focus();
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');

		await expect.poll(getSelectedKeys).toBe('["jasper","zahra"]');
	});

	it('keeps unmounted section rows out of select-all when the body declares them', async () => {
		render(SectionRowTest, {
			items: createManyItems(20, 5),
			declareSections: true,
			virtualizer: { rowHeight: 32, sectionRowHeight: 24, overscan: 2 }
		});

		await userEvent.click(document.querySelector<HTMLElement>('[data-testid="header-checkbox"]')!);
		await expect.poll(() => JSON.parse(getSelectedKeys() ?? '[]') as string[]).toHaveLength(100);
		const keys = JSON.parse(getSelectedKeys() ?? '[]') as string[];
		expect(keys.some((key) => key.startsWith('group-'))).toBe(false);
	});

	it('fires onAction on click and on Enter, and never onRowAction', async () => {
		const onRowAction = vi.fn();
		const onSectionAction = vi.fn();
		render(SectionRowTest, { onRowAction, onSectionAction });

		await userEvent.click(getSectionCell('group-admin'));
		expect(onSectionAction).toHaveBeenCalledTimes(1);
		expect(onSectionAction).toHaveBeenLastCalledWith('group-admin');
		await expect.poll(() => document.activeElement).toBe(getSectionCell('group-admin'));
		expect(getSectionRow('group-admin').getAttribute('aria-expanded')).toBe('false');

		await userEvent.keyboard('{Enter}');
		expect(onSectionAction).toHaveBeenCalledTimes(2);
		await userEvent.keyboard(' ');
		expect(onSectionAction).toHaveBeenCalledTimes(3);

		expect(onRowAction).not.toHaveBeenCalled();
		expect(getSelectedKeys()).toBe('[]');
	});

	it('walks into and out of a section row with the vertical arrows under grid navigation', async () => {
		render(SectionRowTest);

		document.querySelector<HTMLElement>('[data-testid="email-cell-jasper"]')!.focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(getSectionCell('group-admin'));
		await expect
			.poll(() => getSectionCell('group-admin').getAttribute('data-focus-visible'))
			.toBe('true');
		expect(getSectionRow('group-admin').getAttribute('data-focus-visible-within')).toBe('true');

		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => document.activeElement?.closest('tr')?.getAttribute('data-testid'))
			.toBe('row-zahra');

		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => document.activeElement).toBe(getSectionCell('group-admin'));
		await userEvent.keyboard('{ArrowUp}');
		await expect
			.poll(() => document.activeElement?.closest('tr')?.getAttribute('data-testid'))
			.toBe('row-jasper');
	});

	it('keeps the focus on its single cell with Home, End and the horizontal arrows', async () => {
		render(SectionRowTest);
		const cell = getSectionCell('group-admin');

		cell.focus();
		for (const key of ['{ArrowLeft}', '{ArrowRight}', '{Home}', '{End}', '{ArrowRight}']) {
			await userEvent.keyboard(key);
			expect(document.activeElement).toBe(cell);
		}
	});

	it('is a row stop like any other under row navigation', async () => {
		const onSectionAction = vi.fn();
		render(SectionRowTest, { keyboardNavigation: 'row', onSectionAction });

		document.querySelectorAll<HTMLElement>('thead [role="columnheader"]')[1].focus();
		await userEvent.keyboard('{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(getSectionRow('group-developer'));
		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => document.activeElement)
			.toBe(getSectionRow('group-developer').nextElementSibling);
		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		await expect.poll(() => document.activeElement).toBe(getSectionRow('group-admin'));
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(getSectionRow('group-admin'));

		await userEvent.keyboard('{Enter}');
		expect(onSectionAction).toHaveBeenCalledWith('group-admin');
		expect(getSelectedKeys()).toBe('[]');
	});

	it('sizes the virtual spacers with the section row height', async () => {
		const items = createManyItems(20, 5);
		render(SectionRowTest, {
			items,
			declareSections: true,
			virtualizer: { rowHeight: 32, sectionRowHeight: 24, overscan: 0 }
		});

		await expect
			.poll(
				() =>
					document.querySelector<HTMLElement>('[data-virtual-spacer="bottom"] div')?.style.height
			)
			.toBeTruthy();

		// 20 groups x (24 + 5 x 32) = 3680px in all. The spacers plus the rows
		// that are mounted must add up to that, whatever the window is.
		const mountedHeight = Array.from(
			document.querySelectorAll<HTMLElement>('tbody tr[data-testid]')
		).reduce((total, row) => total + (row.hasAttribute('data-section-row') ? 24 : 32), 0);
		const top = parseFloat(
			document.querySelector<HTMLElement>('[data-virtual-spacer="top"] div')?.style.height ?? '0'
		);
		const bottom = parseFloat(
			document.querySelector<HTMLElement>('[data-virtual-spacer="bottom"] div')!.style.height
		);
		expect(top + mountedHeight + bottom).toBe(3680);

		const scroller = document.querySelector('table')!.parentElement!;
		// Group 10 starts at 10 x 184 = 1840px.
		scroller.scrollTop = 1840;
		scroller.dispatchEvent(new Event('scroll'));
		await expect.poll(() => Boolean(getSectionRow('group-10'))).toBe(true);
	});
});
