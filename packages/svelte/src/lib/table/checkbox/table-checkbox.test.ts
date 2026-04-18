import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import CheckboxTest from './table-checkbox-test.svelte';

describe('Table.Checkbox', () => {
	it('renders header and body checkboxes in multiple mode', async () => {
		render(CheckboxTest, { selectionMode: 'multiple' });

		expect(document.querySelector('[data-testid="header-checkbox"]')).toBeTruthy();
		expect(document.querySelector('[data-testid="row-checkbox-danilo"]')).toBeTruthy();
	});

	it('hides all table checkboxes when selectionMode is none', async () => {
		render(CheckboxTest, { selectionMode: 'none' });

		expect(document.querySelector('[data-testid="header-checkbox"]')).toBeNull();
		expect(document.querySelector('[data-testid="row-checkbox-danilo"]')).toBeNull();
	});

	it('reflects the initial header checkbox state immediately when rows start selected', async () => {
		render(CheckboxTest, {
			selectionMode: 'multiple',
			initialSelectedKeys: ['danilo']
		});

		expect(
			document.querySelector('[data-testid="header-checkbox"]')?.getAttribute('aria-checked')
		).toBe('mixed');
	});

	it('toggles row selection explicitly even in replace mode', async () => {
		render(CheckboxTest, {
			selectionMode: 'multiple',
			selectionBehavior: 'replace',
			initialSelectedKeys: ['danilo']
		});

		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="row-checkbox-zahra"]')!
		);

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo","zahra"]');
	});

	it('keeps the row checkbox checked when disallowEmptySelection prevents deselection', async () => {
		render(CheckboxTest, {
			selectionMode: 'multiple',
			disallowEmptySelection: true,
			initialSelectedKeys: ['danilo']
		});

		const rowCheckbox = document.querySelector<HTMLElement>('[data-testid="row-checkbox-danilo"]')!;

		await userEvent.click(rowCheckbox);

		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo"]');
		await expect.poll(() => rowCheckbox.getAttribute('aria-checked')).toBe('true');
	});

	it('selects and deselects all non-disabled rows from the header checkbox', async () => {
		render(CheckboxTest, {
			selectionMode: 'multiple',
			disabledKeys: ['zahra']
		});

		const headerCheckbox = document.querySelector<HTMLElement>('[data-testid="header-checkbox"]')!;

		await userEvent.click(headerCheckbox);
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('["danilo","jasper"]');

		await userEvent.click(headerCheckbox);
		await expect
			.poll(() => document.querySelector('[data-testid="selected-keys"]')?.textContent)
			.toBe('[]');
	});

	it('uses the checkbox as the cell tab stop when rendered', async () => {
		render(CheckboxTest, { selectionMode: 'multiple' });

		const headerCheckbox = document.querySelector<HTMLElement>('[data-testid="header-checkbox"]')!;
		const headerCell = document.querySelector<HTMLElement>(
			'[data-testid="selection-header-cell"]'
		)!;

		expect(headerCheckbox.getAttribute('tabindex')).toBe('0');
		expect(headerCell.getAttribute('tabindex')).toBeNull();
	});

	it('disables row checkboxes for selection-only disabled rows', async () => {
		render(CheckboxTest, {
			selectionMode: 'multiple',
			disabledBehavior: 'selection',
			disabledKeys: ['zahra']
		});

		expect(
			document.querySelector('[data-testid="row-checkbox-zahra"]')?.getAttribute('aria-disabled')
		).toBe('true');
		expect(
			document.querySelector('[data-testid="row-checkbox-danilo"]')?.getAttribute('aria-disabled')
		).toBeNull();
	});

	it('clears checkbox focus-visible when a pointer click takes over from keyboard interaction', async () => {
		render(CheckboxTest, { selectionMode: 'multiple' });

		const rowCheckbox = document.querySelector<HTMLElement>('[data-testid="row-checkbox-danilo"]')!;

		rowCheckbox.focus();
		await userEvent.keyboard('{Space>}');

		await expect.poll(() => rowCheckbox.getAttribute('data-focus-visible')).toBe('true');

		await userEvent.keyboard('{/Space}');
		await userEvent.click(rowCheckbox);

		await expect.poll(() => rowCheckbox.getAttribute('data-focus-visible')).toBeNull();
	});
});
