import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	createKeyboardNavigation,
	rovingTabindex,
	type KeyboardNavigationOptions
} from './keyboard-navigation';

function createItems(container: HTMLElement, labels: string[]): HTMLElement[] {
	return labels.map((label) => {
		const item = document.createElement('div');
		item.setAttribute('data-navigation-item', '');
		item.dataset.itemId = label;
		item.tabIndex = -1;
		item.textContent = label;
		container.appendChild(item);
		return item;
	});
}

function pressKey(target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
	target.dispatchEvent(event);
	return event;
}

describe('createKeyboardNavigation', () => {
	let container: HTMLElement;
	let destroy: (() => void) | undefined;

	beforeEach(() => {
		container = document.createElement('div');
		container.tabIndex = -1;
		document.body.appendChild(container);
	});

	afterEach(() => {
		destroy?.();
		destroy = undefined;
		container.remove();
	});

	function setup(labels: string[], options: KeyboardNavigationOptions = {}) {
		const items = createItems(container, labels);
		const nav = createKeyboardNavigation(options);
		const action = nav.action(container);
		destroy = action.destroy;
		return { nav, items };
	}

	describe('key repeat handling', () => {
		it('does not preventDefault a held (repeating) Tab, so focus can leave the widget', () => {
			const { nav, items } = setup(['One', 'Two', 'Three']);
			nav.focusFirst();

			const event = pressKey(items[0], 'Tab', { repeat: true });

			expect(event.defaultPrevented).toBe(false);
		});

		it('lets Home/End act on key repeat', () => {
			const { nav, items } = setup(['One', 'Two', 'Three']);
			nav.focusFirst();

			const event = pressKey(items[0], 'End', { repeat: true });

			expect(event.defaultPrevented).toBe(true);
			expect(document.activeElement).toBe(items[2]);
		});

		it('consumes a repeating Space/Enter without re-triggering onSelect', () => {
			const onSelect = vi.fn();
			const { nav, items } = setup(['One', 'Two', 'Three'], { onSelect });
			nav.focusFirst();

			const initial = pressKey(items[0], ' ');
			expect(initial.defaultPrevented).toBe(true);
			expect(onSelect).toHaveBeenCalledTimes(1);

			const repeat = pressKey(items[0], ' ', { repeat: true });
			// Still consumed (a held Space must not scroll the page) but not re-triggered.
			expect(repeat.defaultPrevented).toBe(true);
			expect(onSelect).toHaveBeenCalledTimes(1);

			const repeatedEnter = pressKey(items[0], 'Enter', { repeat: true });
			expect(repeatedEnter.defaultPrevented).toBe(true);
			expect(onSelect).toHaveBeenCalledTimes(1);
		});
	});

	describe('typeahead', () => {
		it('matches from the start when nothing is focused', () => {
			const { items } = setup(['Apple', 'Banana', 'Avocado'], { typeahead: true });

			pressKey(container, 'b');

			expect(document.activeElement).toBe(items[1]);
		});

		it('cycles through items starting with the same character (APG)', () => {
			const { items } = setup(['Apple', 'Avocado', 'Banana', 'Apricot'], { typeahead: true });

			pressKey(container, 'a');
			expect(document.activeElement).toBe(items[0]); // Apple

			pressKey(items[0], 'a');
			expect(document.activeElement).toBe(items[1]); // Avocado

			pressKey(items[1], 'a');
			expect(document.activeElement).toBe(items[3]); // Apricot (skips Banana)

			pressKey(items[3], 'a');
			expect(document.activeElement).toBe(items[0]); // wraps back to Apple
		});

		it('starts a multi-character search after the focused item and wraps', () => {
			const { nav, items } = setup(['Apple', 'Apricot', 'Cherry'], { typeahead: true });
			nav.focusById('Cherry');

			// 'a' wraps past the end to Apple; 'ap' then finds the NEXT match after it (Apricot),
			// per APG's "focus moves to the next item" rule.
			pressKey(items[2], 'a');
			expect(document.activeElement).toBe(items[0]);
			pressKey(items[0], 'p');
			expect(document.activeElement).toBe(items[1]);
		});

		it('a growing buffer can still confirm the currently focused item', () => {
			const { nav, items } = setup(['Banana', 'Blueberry'], { typeahead: true });
			nav.focusById('Banana');

			// 'b' cycles to Blueberry; adding 'l' keeps it (only match), even though the
			// search starts after the focused item.
			pressKey(items[0], 'b');
			expect(document.activeElement).toBe(items[1]);
			pressKey(items[1], 'l');
			expect(document.activeElement).toBe(items[1]);
		});
	});

	describe('getCurrentIndex priority', () => {
		it('navigates from document.activeElement when it moved without the controller knowing', () => {
			const { nav, items } = setup(['One', 'Two', 'Three', 'Four']);
			nav.focusFirst(); // internal store points at "One"

			// Native focus change the controller did not observe (e.g. script/mouse focus).
			items[2].focus();

			nav.focusNext();

			// From "Three" (live focus), not from the stale "One" in the store.
			expect(document.activeElement).toBe(items[3]);
		});

		it('falls back to the internal store when DOM focus is not on an item (virtual focus)', () => {
			const outside = document.createElement('button');
			document.body.appendChild(outside);
			const { nav, items } = setup(['One', 'Two', 'Three']);
			nav.setCurrentId('Two');
			outside.focus(); // DOM focus not on any item — the store must drive navigation

			nav.focusNext();

			expect(document.activeElement).toBe(items[2]);
			outside.remove();
		});
	});
});

describe('rovingTabindex', () => {
	let container: HTMLElement;
	let action: ReturnType<typeof rovingTabindex> | undefined;

	beforeEach(() => {
		container = document.createElement('div');
		container.tabIndex = -1;
		document.body.appendChild(container);
	});

	afterEach(() => {
		action?.destroy();
		action = undefined;
		container.remove();
	});

	it('applies orientation and loop changes passed through update()', () => {
		const items = createItems(container, ['One', 'Two', 'Three']);
		action = rovingTabindex(container, { orientation: 'vertical', loop: false });

		items[0].focus();
		pressKey(items[0], 'ArrowDown');
		expect(document.activeElement).toBe(items[1]);

		// Switch to horizontal with looping after mount.
		action.update({ orientation: 'horizontal', loop: true });

		// Vertical keys are no longer handled...
		const down = pressKey(items[1], 'ArrowDown');
		expect(down.defaultPrevented).toBe(false);
		expect(document.activeElement).toBe(items[1]);

		// ...horizontal keys are, and loop now wraps at the end.
		pressKey(items[1], 'ArrowRight');
		expect(document.activeElement).toBe(items[2]);
		pressKey(items[2], 'ArrowRight');
		expect(document.activeElement).toBe(items[0]);
	});

	it('applies itemSelector changes passed through update()', () => {
		const items = createItems(container, ['One', 'Two', 'Three']);
		items[1].setAttribute('data-skip', '');
		action = rovingTabindex(container);

		items[0].focus();
		pressKey(items[0], 'ArrowDown');
		expect(document.activeElement).toBe(items[1]);

		action.update({ itemSelector: '[data-navigation-item]:not([data-skip])' });

		items[0].focus();
		pressKey(items[0], 'ArrowDown');
		expect(document.activeElement).toBe(items[2]);
	});
});
