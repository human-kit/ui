import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ListBoxTest from './listbox-test.svelte';

/** Selected option labels, in list order. */
function selectedLabels() {
	return Array.from(document.querySelectorAll('[role="option"][aria-selected="true"]')).map(
		(option) => option.textContent?.trim()
	);
}

function option(name: string) {
	return Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
		(element) => element.textContent?.trim() === name
	)!;
}

/**
 * Moves the real pointer off the list before a keyboard sequence.
 *
 * A ListBox hands focus to whatever option the pointer is over, so a cursor left on a row by
 * an earlier test silently moves the anchor out from under the keys being pressed.
 */
async function parkPointer() {
	await userEvent.hover(document.querySelector<HTMLElement>('[data-testid="outside-input"]')!);
}

/** Clicks an option with modifier keys held, the way a real range selection is made. */
async function clickWith(name: string, modifier: 'Shift' | 'Control') {
	await userEvent.keyboard(`{${modifier}>}`);
	await userEvent.click(option(name));
	await userEvent.keyboard(`{/${modifier}}`);
}

describe('ListBox range selection', () => {
	describe('pointer', () => {
		it('selects everything between the anchor and the shift-clicked option', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });

			await userEvent.click(option('Banana'));
			await clickWith('Grape', 'Shift');

			expect(selectedLabels()).toEqual(['Banana', 'Cherry', 'Grape']);
		});

		it('spans the same range when the shift-click is above the anchor', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });

			await userEvent.click(option('Grape'));
			await clickWith('Banana', 'Shift');

			expect(selectedLabels()).toEqual(['Banana', 'Cherry', 'Grape']);
		});

		it('shrinks the range on a second shift-click instead of adding to it', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });

			await userEvent.click(option('Banana'));
			await clickWith('Orange', 'Shift');
			expect(selectedLabels()).toEqual(['Banana', 'Cherry', 'Grape', 'Orange']);

			// Still measured from the anchor, so pulling back really does deselect.
			await clickWith('Cherry', 'Shift');
			expect(selectedLabels()).toEqual(['Banana', 'Cherry']);
		});

		it('re-anchors on a click without modifiers', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });

			await userEvent.click(option('Apple'));
			await userEvent.click(option('Cherry'));
			await clickWith('Grape', 'Shift');

			expect(selectedLabels()).toEqual(['Cherry', 'Grape']);
		});

		it('leaves disabled options out of the range', async () => {
			render(ListBoxTest, { selectionMode: 'multiple', disabledKeys: ['cherry'] });

			await userEvent.click(option('Banana'));
			await clickWith('Grape', 'Shift');

			expect(selectedLabels()).toEqual(['Banana', 'Grape']);
		});

		it('ignores modifiers in single-selection mode', async () => {
			render(ListBoxTest, { selectionMode: 'single' });

			await userEvent.click(option('Banana'));
			await clickWith('Grape', 'Shift');

			expect(selectedLabels()).toEqual(['Grape']);
		});

		it('adds one option with ctrl-click even when clicking replaces the selection', async () => {
			render(ListBoxTest, { selectionMode: 'multiple', selectionBehavior: 'replace' });

			await userEvent.click(option('Banana'));
			await clickWith('Grape', 'Control');
			expect(selectedLabels()).toEqual(['Banana', 'Grape']);

			// And takes it back out again.
			await clickWith('Grape', 'Control');
			expect(selectedLabels()).toEqual(['Banana']);
		});
	});

	describe('keyboard', () => {
		it('extends the selection with shift and the arrow keys', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });
			await parkPointer();

			await userEvent.click(option('Banana'));
			await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');

			expect(selectedLabels()).toEqual(['Banana', 'Cherry', 'Grape']);
		});

		it('shrinks again when the arrows come back toward the anchor', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });
			await parkPointer();

			await userEvent.click(option('Banana'));
			await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{ArrowUp}{/Shift}');

			expect(selectedLabels()).toEqual(['Banana', 'Cherry']);
		});

		it('extends to the ends with shift and Home / End', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });
			await parkPointer();

			await userEvent.click(option('Cherry'));
			await userEvent.keyboard('{Shift>}{End}{/Shift}');
			expect(selectedLabels()).toEqual(['Cherry', 'Grape', 'Orange']);

			await userEvent.keyboard('{Shift>}{Home}{/Shift}');
			expect(selectedLabels()).toEqual(['Apple', 'Banana', 'Cherry']);
		});

		it('starts the range at the focused option when nothing was selected yet', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });
			await parkPointer();

			// Focused rather than clicked: a click on the list lands on whichever option is
			// under it and selects that one, which is the state this test is about not having.
			document.querySelector<HTMLElement>('[role="listbox"]')!.focus();
			await userEvent.keyboard('{Home}{ArrowDown}');
			expect(selectedLabels()).toEqual([]);

			await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
			expect(selectedLabels()).toEqual(['Banana', 'Cherry']);
		});

		it('marks the row it lands on as focus-visible, so a ring can be drawn', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });
			await parkPointer();

			document.querySelector<HTMLElement>('[role="listbox"]')!.focus();
			await userEvent.keyboard('{Home}{ArrowDown}');

			const focused = document.querySelector('[role="option"][data-focus-visible]');
			expect(focused?.textContent?.trim()).toBe('Banana');

			await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
			expect(
				document.querySelector('[role="option"][data-focus-visible]')?.textContent?.trim()
			).toBe('Cherry');
		});

		it('moves without selecting when shift is not held', async () => {
			render(ListBoxTest, { selectionMode: 'multiple' });
			await parkPointer();

			// Focused rather than clicked: a click on the list lands on whichever option is
			// under it and selects that one, which is the state this test is about not having.
			document.querySelector<HTMLElement>('[role="listbox"]')!.focus();
			await userEvent.keyboard('{Home}{ArrowDown}{ArrowDown}');

			expect(selectedLabels()).toEqual([]);
		});
	});
});
