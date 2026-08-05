import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import TransferListTest from './transfer-list-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function list(side: 'source' | 'target') {
	return document.querySelector<HTMLElement>(`[role="listbox"][data-side="${side}"]`)!;
}

/** Visible option labels of one side, in order. */
function labels(side: 'source' | 'target') {
	return Array.from(list(side).querySelectorAll('[role="option"]')).map((option) =>
		option.textContent?.trim()
	);
}

function option(side: 'source' | 'target', name: string) {
	return Array.from(list(side).querySelectorAll<HTMLElement>('[role="option"]')).find(
		(element) => element.textContent?.trim() === name
	)!;
}

function button(name: string) {
	return Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
		(element) => element.textContent?.trim() === name
	)!;
}

function statusText() {
	// Not `[role="status"]`: every ButtonRoot renders one of those for its pending state.
	return document.querySelector('[data-transfer-list-status]')?.textContent?.trim();
}

/** Clicks an option with Shift held, to select a range. */
async function shiftClick(side: 'source' | 'target', name: string) {
	await userEvent.keyboard('{Shift>}');
	await userEvent.click(option(side, name));
	await userEvent.keyboard('{/Shift}');
}

describe('TransferList', () => {
	describe('moving', () => {
		it('starts with everything on the source side', async () => {
			render(TransferListTest);

			expect(labels('source')).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']);
			expect(labels('target')).toEqual([]);
		});

		it('moves the selection to the target', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			expect(labels('source')).toEqual(['Apple', 'Cherry', 'Grape', 'Orange']);
			expect(labels('target')).toEqual(['Banana']);
		});

		it('moves a whole range selected with shift', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await shiftClick('source', 'Grape');
			await userEvent.click(button('Add'));

			expect(labels('target')).toEqual(['Banana', 'Cherry', 'Grape']);
		});

		it('keeps the target in the order items were moved, not the original order', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Orange'));
			await userEvent.click(button('Add'));
			await userEvent.click(option('source', 'Apple'));
			await userEvent.click(button('Add'));

			expect(labels('target')).toEqual(['Orange', 'Apple']);
		});

		it('moves everything with move-all and back again', async () => {
			render(TransferListTest);

			await userEvent.click(button('Add all'));
			expect(labels('source')).toEqual([]);
			expect(labels('target')).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']);

			await userEvent.click(button('Remove all'));
			expect(labels('source')).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']);
			expect(labels('target')).toEqual([]);
		});

		it('moves an item on double click', async () => {
			render(TransferListTest);

			await userEvent.dblClick(option('source', 'Cherry'));

			expect(labels('target')).toEqual(['Cherry']);
		});

		it('clears the selection after a move, so the return trip is not one stray click', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			expect(document.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(0);
			expect(button('Remove')).toBeDisabled();
		});

		it('reports the new value and what moved', async () => {
			const onChange = vi.fn();
			render(TransferListTest, { onChange });

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(option('source', 'Grape'));
			await userEvent.click(button('Add'));

			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onChange.mock.calls[0][0]).toEqual(['banana', 'grape']);
			expect(onChange.mock.calls[0][1]).toEqual({
				keys: ['banana', 'grape'],
				from: 'source',
				to: 'target'
			});
		});

		it('honours defaultValue', async () => {
			render(TransferListTest, { defaultValue: ['cherry', 'apple'] });

			expect(labels('source')).toEqual(['Banana', 'Grape', 'Orange']);
			expect(labels('target')).toEqual(['Cherry', 'Apple']);
		});

		it('does not move anything in controlled mode until the parent says so', async () => {
			const onChange = vi.fn();
			render(TransferListTest, { value: [], controlledValue: true, onChange });

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			expect(onChange).toHaveBeenCalledTimes(1);
			expect(labels('target')).toEqual([]);
			expect(labels('source')).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']);
		});
	});

	describe('disabled items', () => {
		it('never moves them, not even with move-all', async () => {
			render(TransferListTest, { disabledKeys: ['cherry'] });

			await userEvent.click(button('Add all'));

			expect(labels('source')).toEqual(['Cherry']);
			expect(labels('target')).toEqual(['Apple', 'Banana', 'Grape', 'Orange']);
		});

		it('leaves them out of a range selection', async () => {
			render(TransferListTest, { disabledKeys: ['cherry'] });

			await userEvent.click(option('source', 'Banana'));
			await shiftClick('source', 'Grape');
			await userEvent.click(button('Add'));

			expect(labels('target')).toEqual(['Banana', 'Grape']);
		});

		it('does not move on double click', async () => {
			render(TransferListTest, { disabledKeys: ['cherry'] });

			// Dispatched rather than driven through userEvent: a disabled row fails its
			// actionability check, so the helper waits for a click that will never land.
			option('source', 'Cherry').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

			expect(labels('target')).toEqual([]);
		});
	});

	describe('button states', () => {
		it('disables move-selected until something movable is selected', async () => {
			render(TransferListTest);

			expect(button('Add')).toBeDisabled();

			await userEvent.click(option('source', 'Banana'));
			expect(button('Add')).toBeEnabled();
		});

		it('disables move-all when the side it drains is empty', async () => {
			render(TransferListTest);

			expect(button('Remove all')).toBeDisabled();

			await userEvent.click(button('Add all'));
			expect(button('Add all')).toBeDisabled();
			expect(button('Remove all')).toBeEnabled();
		});

		it('disables move-all when every remaining item is pinned', async () => {
			render(TransferListTest, { disabledKeys: ['cherry'], defaultValue: [] });

			await userEvent.click(button('Add all'));

			// Only the disabled Cherry is left, so there is nothing more to move.
			expect(labels('source')).toEqual(['Cherry']);
			expect(button('Add all')).toBeDisabled();
		});

		it('names the buttons after the list items go to', async () => {
			render(TransferListTest);

			expect(button('Add')).toHaveAttribute('aria-label', 'Move selected to Selected');
			expect(button('Add all')).toHaveAttribute('aria-label', 'Move all to Selected');
			expect(button('Remove')).toHaveAttribute('aria-label', 'Move selected to Available');
			expect(button('Remove all')).toHaveAttribute('aria-label', 'Move all to Available');
		});
	});

	describe('focus after a move', () => {
		it('follows the items when the button it was on goes disabled', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			// Clearing the selection leaves the button with nothing to move, and a disabled
			// button cannot hold focus — without the hand-off it would land on <body>.
			expect(button('Add')).toBeDisabled();
			expect(list('target').contains(document.activeElement)).toBe(true);
		});

		it('stays on the button when a controlled parent rejects the move', async () => {
			render(TransferListTest, { value: [], controlledValue: true });

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			// Nothing moved and the selection still stands, so the button is still live and
			// there is no reason to take focus away from it.
			expect(button('Add')).toBeEnabled();
			expect(document.activeElement).toBe(button('Add'));
		});

		it('lands on the row that took the place of a double-clicked item', async () => {
			render(TransferListTest);

			await userEvent.dblClick(option('source', 'Banana'));

			expect(document.activeElement).toBe(option('source', 'Cherry'));
		});

		it('lands on the last row when the double-clicked item was the last one', async () => {
			render(TransferListTest);

			await userEvent.dblClick(option('source', 'Orange'));

			expect(document.activeElement).toBe(option('source', 'Grape'));
		});

		it('moves to the destination list when the side is emptied by a double click', async () => {
			render(TransferListTest, { defaultValue: ['apple', 'banana', 'cherry', 'grape'] });

			await userEvent.dblClick(option('source', 'Orange'));

			expect(labels('source')).toEqual([]);
			expect(list('target').contains(document.activeElement)).toBe(true);
		});
	});

	describe('accessibility', () => {
		it('labels both lists and marks them multi-selectable', async () => {
			render(TransferListTest);

			expect(list('source')).toHaveAttribute('aria-label', 'Available');
			expect(list('target')).toHaveAttribute('aria-label', 'Selected');
			expect(list('source')).toHaveAttribute('aria-multiselectable', 'true');
		});

		it('announces each move', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));
			await expect.poll(statusText).toBe('1 item moved to Selected');

			await userEvent.click(button('Add all'));
			await expect.poll(statusText).toBe('4 items moved to Selected');
		});

		it('marks an emptied side', async () => {
			render(TransferListTest);

			expect(list('target')).toHaveAttribute('data-empty', 'true');

			await userEvent.click(button('Add all'));
			expect(list('target')).not.toHaveAttribute('data-empty');
			expect(list('source')).toHaveAttribute('data-empty', 'true');
		});

		it('never reports a false focus state', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));
			expectNoFalseFocusAttributes();
		});
	});
});
