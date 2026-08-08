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

/**
 * A button with nothing to do says so with `aria-disabled` and stays in the tab order —
 * natively disabling it would hide half the actions from anyone exploring with a keyboard.
 */
function expectUnavailable(element: HTMLButtonElement) {
	expect(element).toHaveAttribute('aria-disabled', 'true');
	expect(element).toHaveAttribute('data-disabled', 'true');
	// The native attribute is what removes an element from the tab order, so its absence is
	// the whole point — `toBeDisabled` would not tell them apart, since it reads either.
	expect(element).not.toHaveAttribute('disabled');
}

function expectAvailable(element: HTMLButtonElement) {
	expect(element).not.toHaveAttribute('aria-disabled');
	expect(element).not.toHaveAttribute('disabled');
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
			expectUnavailable(button('Remove'));
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
				type: 'move',
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

			expectUnavailable(button('Add'));

			await userEvent.click(option('source', 'Banana'));
			expectAvailable(button('Add'));
		});

		it('disables move-all when the side it drains is empty', async () => {
			render(TransferListTest);

			expectUnavailable(button('Remove all'));

			await userEvent.click(button('Add all'));
			expectUnavailable(button('Add all'));
			expectAvailable(button('Remove all'));
		});

		it('disables move-all when every remaining item is pinned', async () => {
			render(TransferListTest, { disabledKeys: ['cherry'], defaultValue: [] });

			await userEvent.click(button('Add all'));

			// Only the disabled Cherry is left, so there is nothing more to move.
			expect(labels('source')).toEqual(['Cherry']);
			expectUnavailable(button('Add all'));
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
		it('stays on the button, which keeps holding focus after it runs out of work', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			// The move clears the selection, so this button has nothing left to do — but
			// `aria-disabled` keeps it focusable, so focus simply stays where the press was
			// instead of having to be handed elsewhere to keep it off the <body>.
			expectUnavailable(button('Add'));
			expect(document.activeElement).toBe(button('Add'));
		});

		it('stays on the button when a controlled parent rejects the move', async () => {
			render(TransferListTest, { value: [], controlledValue: true });

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			expectAvailable(button('Add'));
			expect(document.activeElement).toBe(button('Add'));
		});

		it('keeps every action reachable by keyboard, available or not', async () => {
			render(TransferListTest);

			// Nothing is selected, so most of these have no work — and would be gone from the
			// tab order entirely if they were natively disabled.
			for (const name of ['Add', 'Add all', 'Remove all', 'Remove', 'Up', 'Down']) {
				expect(button(name)).not.toHaveAttribute('disabled');
			}
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

	describe('filtering', () => {
		it('shows only the matching items', async () => {
			render(TransferListTest, { sourceQuery: 'an' });

			expect(labels('source')).toEqual(['Banana', 'Orange']);
		});

		it('moves only what the filter is showing, not the whole side', async () => {
			render(TransferListTest, { sourceQuery: 'an' });

			await userEvent.click(button('Add all'));

			expect(labels('target')).toEqual(['Banana', 'Orange']);
			expect(labels('source')).toEqual([]);
		});

		it('disables move-all when the filter matches nothing', async () => {
			render(TransferListTest, { sourceQuery: 'zzz' });

			expect(labels('source')).toEqual([]);
			expectUnavailable(button('Add all'));
		});
	});

	describe('reordering the target', () => {
		it('moves the selection one position up and down', async () => {
			render(TransferListTest, { defaultValue: ['apple', 'banana', 'cherry'] });

			await userEvent.click(option('target', 'Cherry'));
			await userEvent.click(button('Up'));
			expect(labels('target')).toEqual(['Apple', 'Cherry', 'Banana']);

			await userEvent.click(button('Down'));
			expect(labels('target')).toEqual(['Apple', 'Banana', 'Cherry']);
		});

		it('keeps a selected block together', async () => {
			render(TransferListTest, { defaultValue: ['apple', 'banana', 'cherry', 'grape'] });

			await userEvent.click(option('target', 'Cherry'));
			await userEvent.click(option('target', 'Grape'));
			await userEvent.click(button('Up'));

			expect(labels('target')).toEqual(['Apple', 'Cherry', 'Grape', 'Banana']);
		});

		it('stops at the ends instead of doing nothing quietly', async () => {
			render(TransferListTest, { defaultValue: ['apple', 'banana'] });

			await userEvent.click(option('target', 'Apple'));
			expectUnavailable(button('Up'));
			expectAvailable(button('Down'));

			await userEvent.click(button('Down'));
			expect(labels('target')).toEqual(['Banana', 'Apple']);
			expectUnavailable(button('Down'));
		});

		it('is disabled while the right-hand list has no selection', async () => {
			render(TransferListTest, { defaultValue: ['apple', 'banana'] });

			expectUnavailable(button('Up'));
			expectUnavailable(button('Down'));
		});

		it('keeps the selection so the button can be pressed again', async () => {
			render(TransferListTest, { defaultValue: ['apple', 'banana', 'cherry'] });

			await userEvent.click(option('target', 'Cherry'));
			await userEvent.click(button('Up'));
			await userEvent.click(button('Up'));

			expect(labels('target')).toEqual(['Cherry', 'Apple', 'Banana']);
		});

		it('reports the reorder and announces it', async () => {
			const onChange = vi.fn();
			render(TransferListTest, { defaultValue: ['apple', 'banana'], onChange });

			await userEvent.click(option('target', 'Banana'));
			await userEvent.click(button('Up'));

			expect(onChange.mock.calls[0][0]).toEqual(['banana', 'apple']);
			expect(onChange.mock.calls[0][1]).toEqual({
				type: 'reorder',
				keys: ['banana'],
				from: 'target',
				to: 'target',
				direction: 'up'
			});
			await expect.poll(statusText).toBe('1 item moved up');
		});
	});

	describe('keyboard shortcut', () => {
		it('sends the selection to the other list without leaving it', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.keyboard('{Control>}{Enter}{/Control}');

			expect(labels('target')).toEqual(['Banana']);
		});

		it('sends it back from the other side, with no direction to get wrong', async () => {
			render(TransferListTest, { defaultValue: ['banana'] });

			await userEvent.click(option('target', 'Banana'));
			await userEvent.keyboard('{Control>}{Enter}{/Control}');

			expect(labels('source')).toEqual(['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']);
			expect(labels('target')).toEqual([]);
		});

		it('leaves focus on the row that took the moved one place', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.keyboard('{Control>}{Enter}{/Control}');

			expect(document.activeElement).toBe(option('source', 'Cherry'));
		});

		it('does not toggle the option it fires on', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.keyboard('{Control>}{Enter}{/Control}');

			// Plain Enter still belongs to selection; the shortcut must not reach it.
			expect(document.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(0);
		});

		it('does nothing while disabled', async () => {
			render(TransferListTest, { moveShortcut: false });

			await userEvent.click(option('source', 'Banana'));
			await userEvent.keyboard('{Control>}{Enter}{/Control}');

			expect(labels('target')).toEqual([]);
		});

		it('announces itself on each list', async () => {
			render(TransferListTest);

			expect(list('source')).toHaveAttribute('aria-keyshortcuts', 'Control+Enter');
			expect(list('target')).toHaveAttribute('aria-keyshortcuts', 'Control+Enter');
		});
	});

	describe('form integration', () => {
		it('renders one hidden input per key, in order', async () => {
			render(TransferListTest, { name: 'columns', defaultValue: ['cherry', 'apple'] });

			const inputs = Array.from(
				document.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="columns"]')
			);
			expect(inputs.map((input) => input.value)).toEqual(['cherry', 'apple']);
		});

		it('keeps the inputs in step with the moves', async () => {
			render(TransferListTest, { name: 'columns' });

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));

			const inputs = Array.from(
				document.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="columns"]')
			);
			expect(inputs.map((input) => input.value)).toEqual(['banana']);
		});

		it('renders nothing without a name', async () => {
			render(TransferListTest, { defaultValue: ['apple'] });

			expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
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

		it('groups the two lists and the buttons once it has a name', async () => {
			render(TransferListTest, { label: 'Visible columns' });

			const root = document.querySelector('[data-transfer-list]')!;
			expect(root).toHaveAttribute('role', 'group');
			expect(root).toHaveAttribute('aria-label', 'Visible columns');
		});

		it('stays a plain element when there is no name to group under', async () => {
			render(TransferListTest);

			// An unlabelled group is skipped by assistive technology, so claiming the role
			// without a name would only add noise.
			expect(document.querySelector('[data-transfer-list]')).not.toHaveAttribute('role');
		});

		it('never reports a false focus state', async () => {
			render(TransferListTest);

			await userEvent.click(option('source', 'Banana'));
			await userEvent.click(button('Add'));
			expectNoFalseFocusAttributes();
		});
	});
});
