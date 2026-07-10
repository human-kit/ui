import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TablePinnedTest from './table-pinned-test.svelte';

function getByTestId(testId: string) {
	const element = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!element) throw new Error(`Missing element with data-testid="${testId}"`);
	return element;
}

describe('Table column pinning', () => {
	it('sticks pinned header cells with offsets accumulated from preceding same-side pins', async () => {
		render(TablePinnedTest);
		await vi.waitFor(() => {
			expect(getByTestId('header-b').style.insetInlineStart).toBe('60px');
		});

		const headerA = getByTestId('header-a');
		expect(headerA.getAttribute('data-pinned')).toBe('left');
		expect(getComputedStyle(headerA).position).toBe('sticky');
		expect(headerA.style.insetInlineStart).toBe('0px');
		// In LTR layouts inline-start resolves to the physical left edge.
		expect(getComputedStyle(headerA).left).toBe('0px');
		// `A` is not the inner edge of the left group — `B` is pinned after it.
		expect(headerA.getAttribute('data-pin-edge')).toBeNull();

		const headerB = getByTestId('header-b');
		expect(headerB.style.insetInlineStart).toBe('60px');
		expect(headerB.getAttribute('data-pin-edge')).toBe('true');

		const headerC = getByTestId('header-c');
		expect(headerC.getAttribute('data-pinned')).toBeNull();
		expect(getComputedStyle(headerC).position).toBe('relative');

		const headerD = getByTestId('header-d');
		expect(headerD.getAttribute('data-pinned')).toBe('right');
		expect(headerD.style.insetInlineEnd).toBe('0px');
		expect(headerD.getAttribute('data-pin-edge')).toBe('true');
	});

	it('sticks pinned body cells with the same offsets', async () => {
		render(TablePinnedTest);
		await vi.waitFor(() => {
			expect(getByTestId('cell-b-r1').style.insetInlineStart).toBe('60px');
		});

		const cellA = getByTestId('cell-a-r1');
		expect(getComputedStyle(cellA).position).toBe('sticky');
		expect(cellA.style.insetInlineStart).toBe('0px');

		const cellC = getByTestId('cell-c-r1');
		expect(getComputedStyle(cellC).position).not.toBe('sticky');

		const cellD = getByTestId('cell-d-r2');
		expect(cellD.getAttribute('data-pinned')).toBe('right');
		expect(cellD.style.insetInlineEnd).toBe('0px');
	});
});
