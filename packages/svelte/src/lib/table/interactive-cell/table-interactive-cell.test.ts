import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import InteractiveCellTest from './table-interactive-cell-test.svelte';

describe('Table.InteractiveCell', () => {
	it('keeps grid keyboard navigation when focus is on the cell', async () => {
		render(InteractiveCellTest);
		const firstCell = document.querySelector<HTMLElement>(
			'[data-testid="interactive-cell-danilo"]'
		)!;

		firstCell.focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect
			.poll(() => document.activeElement?.getAttribute('data-testid'))
			.toBe('interactive-cell-zahra');
	});

	it('lets nested controls own keyboard events', async () => {
		render(InteractiveCellTest);
		const input = document.querySelector<HTMLInputElement>('[data-testid="group-input-danilo"]')!;

		input.focus();
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => document.activeElement).toBe(input);
	});

	it('does not trigger row actions from nested control clicks', async () => {
		render(InteractiveCellTest);
		const button = document.querySelector<HTMLButtonElement>(
			'[data-testid="group-button-danilo"]'
		)!;

		await userEvent.click(button);

		await expect
			.poll(() => document.querySelector('[data-testid="row-action-log"]')?.textContent)
			.toBe('[]');
	});
});
