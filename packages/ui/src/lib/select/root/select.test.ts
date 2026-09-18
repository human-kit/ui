import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import SelectTest from './select-test.svelte';
import SelectFormTest from './select-form-test.svelte';
import {
	expectFocusVisibleImpliesFocusWithin,
	expectFocusVisibleImpliesFocused,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';

function queryListbox() {
	return document.querySelector<HTMLElement>('[role="listbox"]');
}

function queryOpenListbox() {
	return document.querySelector<HTMLElement>(
		'[data-select-popover][data-state="open"] [role="listbox"]'
	);
}

function queryTrigger() {
	return document.querySelector<HTMLButtonElement>('[data-select-trigger]')!;
}

function queryRoot() {
	return document.querySelector<HTMLElement>('[data-select]')!;
}

function focusedOptionText() {
	const active = document.activeElement as HTMLElement | null;
	if (!active || active.getAttribute('role') !== 'option') return null;
	return active.textContent?.trim() ?? null;
}

function valueText() {
	return document.querySelector('[data-testid="value"]')?.textContent;
}

function triggerText() {
	return document.querySelector('[data-select-value]')?.textContent?.trim();
}

async function openWithKeyboard(key = '{ArrowDown}') {
	const trigger = queryTrigger();
	trigger.focus();
	await userEvent.keyboard(key);
	await expect.poll(() => queryOpenListbox()).toBeTruthy();
}

describe('Select', () => {
	describe('ARIA', () => {
		it('makes a combobox trigger that owns a listbox popup', async () => {
			render(SelectTest);
			const trigger = queryTrigger();

			expect(trigger.tagName).toBe('BUTTON');
			expect(trigger.getAttribute('type')).toBe('button');
			expect(trigger.getAttribute('role')).toBe('combobox');
			expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
			expect(trigger.getAttribute('aria-expanded')).toBe('false');
			// No dangling reference while the listbox is not in the DOM.
			expect(trigger.hasAttribute('aria-controls')).toBe(false);

			await openWithKeyboard();

			const listbox = queryListbox()!;
			expect(trigger.getAttribute('aria-expanded')).toBe('true');
			expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
			expect(listbox.getAttribute('aria-labelledby')).toBe(trigger.id);
			expect(listbox.getAttribute('aria-multiselectable')).toBe('false');
			expect(listbox.querySelectorAll('[role="option"]').length).toBe(12);
		});

		it('names the trigger with the label and the value, and the label points at the trigger', async () => {
			render(SelectTest);
			const trigger = queryTrigger();
			const label = document.querySelector<HTMLLabelElement>('[data-select-label]')!;
			const value = document.querySelector<HTMLElement>('[data-select-value]')!;

			await expect
				.poll(() => trigger.getAttribute('aria-labelledby'))
				.toBe(`${label.id} ${value.id}`);
			expect(label.getAttribute('for')).toBe(trigger.id);
			expect(label.textContent?.trim()).toBe('Fruit');
			expect(value.textContent?.trim()).toBe('Select an option');
		});

		it('uses aria-label from the root when there is no label part', async () => {
			render(SelectTest, { showLabel: false, ariaLabel: 'Pick a fruit' });
			const trigger = queryTrigger();
			const value = document.querySelector<HTMLElement>('[data-select-value]')!;

			expect(trigger.getAttribute('aria-label')).toBe('Pick a fruit');
			// The trigger names itself, and the algorithm reads its `aria-label` for that entry.
			await expect
				.poll(() => trigger.getAttribute('aria-labelledby'))
				.toBe(`${trigger.id} ${value.id}`);
		});

		it('leaves the name to the content when nothing names the select', async () => {
			render(SelectTest, { showLabel: false });
			const trigger = queryTrigger();
			await new Promise((resolve) => setTimeout(resolve, 20));
			expect(trigger.hasAttribute('aria-labelledby')).toBe(false);
			expect(trigger.hasAttribute('aria-label')).toBe(false);
		});

		it('reflects required, invalid and readonly on the combobox', async () => {
			render(SelectTest, { required: true, invalid: true, readonly: true });
			const trigger = queryTrigger();

			expect(trigger.getAttribute('aria-required')).toBe('true');
			expect(trigger.getAttribute('aria-invalid')).toBe('true');
			expect(trigger.getAttribute('aria-readonly')).toBe('true');
			expect(trigger.getAttribute('data-required')).toBe('true');
			expect(trigger.getAttribute('data-invalid')).toBe('true');
			expect(trigger.getAttribute('data-readonly')).toBe('true');
		});

		it('does not present the popover as a dialog', async () => {
			render(SelectTest);
			await openWithKeyboard();

			const popover = document.querySelector<HTMLElement>('[data-select-popover]')!;
			expect(popover.getAttribute('role')).toBe('presentation');
			expect(popover.hasAttribute('aria-modal')).toBe(false);
			expect(document.querySelector('[role="dialog"]')).toBeNull();
		});

		it('keeps the native control out of the tab order and out of the accessibility tree', async () => {
			render(SelectTest, { name: 'fruit' });
			const native = document.querySelector<HTMLSelectElement>('[data-select] select')!;

			expect(native.getAttribute('tabindex')).toBe('-1');
			expect(native.closest('[aria-hidden="true"]')).toBeTruthy();
			expect(native.name).toBe('fruit');
		});
	});

	describe('Keyboard on the closed trigger', () => {
		it('opens on ArrowDown and focuses the first option with a visible focus', async () => {
			render(SelectTest);
			await openWithKeyboard('{ArrowDown}');

			await expect.poll(() => focusedOptionText()).toBe('Apple');
			const option = document.activeElement as HTMLElement;
			expect(option.getAttribute('data-focused')).toBe('true');
			expect(option.getAttribute('data-focus-visible')).toBe('true');
			expect(queryTrigger().getAttribute('data-state')).toBe('open');
		});

		it('opens on ArrowDown and focuses the selected option', async () => {
			render(SelectTest, { defaultValue: 'kiwi' });
			await openWithKeyboard('{ArrowDown}');

			await expect.poll(() => focusedOptionText()).toBe('Kiwi');
			expect((document.activeElement as HTMLElement).getAttribute('aria-selected')).toBe('true');
		});

		it('opens on ArrowUp and focuses the last option when nothing is selected', async () => {
			render(SelectTest);
			await openWithKeyboard('{ArrowUp}');
			await expect.poll(() => focusedOptionText()).toBe('Plum');
		});

		it('opens on Enter, Space, Home and End', async () => {
			render(SelectTest, { defaultValue: 'kiwi' });

			await openWithKeyboard('{Enter}');
			await expect.poll(() => focusedOptionText()).toBe('Kiwi');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenListbox()).toBeNull();

			await openWithKeyboard(' ');
			await expect.poll(() => focusedOptionText()).toBe('Kiwi');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenListbox()).toBeNull();

			await openWithKeyboard('{Home}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenListbox()).toBeNull();

			await openWithKeyboard('{End}');
			await expect.poll(() => focusedOptionText()).toBe('Plum');
		});

		it('does not change the value when Enter or Space open the list', async () => {
			const onChange = vi.fn();
			render(SelectTest, { onChange });
			await openWithKeyboard('{Enter}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(onChange).not.toHaveBeenCalled();
			expect(valueText()).toBe('null');
		});

		it('opens on a printable character and focuses the option that starts with it', async () => {
			render(SelectTest);
			await openWithKeyboard('m');
			await expect.poll(() => focusedOptionText()).toBe('Mango');
		});

		it('refuses to open while read-only, and the trigger keeps the focus', async () => {
			render(SelectTest, { readonly: true });
			const trigger = queryTrigger();
			trigger.focus();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(queryListbox()).toBeNull();
			expect(document.activeElement).toBe(trigger);

			await userEvent.click(trigger);
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(queryListbox()).toBeNull();
		});

		it('disables the trigger natively', async () => {
			render(SelectTest, { disabled: true });
			const trigger = queryTrigger();
			expect(trigger.disabled).toBe(true);
			expect(queryRoot().getAttribute('data-disabled')).toBe('true');
		});
	});

	describe('Keyboard in the open list', () => {
		it('selects the focused option with Enter, closes, and returns the focus to the trigger', async () => {
			const onChange = vi.fn();
			render(SelectTest, { onChange });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Blueberry');

			await userEvent.keyboard('{Enter}');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).toHaveBeenCalledWith('blueberry');
			expect(valueText()).toBe('"blueberry"');
			await expect.poll(() => triggerText()).toBe('Blueberry');
			const trigger = queryTrigger();
			await expect.poll(() => document.activeElement).toBe(trigger);
			await expect.poll(() => trigger.getAttribute('data-focus-visible')).toBe('true');
			expect(trigger.getAttribute('aria-expanded')).toBe('false');
			expect(trigger.hasAttribute('data-placeholder')).toBe(false);
			expectNoFalseFocusAttributes();
		});

		it('selects the focused option with Space', async () => {
			render(SelectTest);
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Banana');

			await userEvent.keyboard(' ');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(valueText()).toBe('"banana"');
		});

		it('closes on Escape without a change, and the trigger shows a keyboard focus', async () => {
			const onChange = vi.fn();
			render(SelectTest, { defaultValue: 'apple', onChange });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Banana');

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).not.toHaveBeenCalled();
			expect(valueText()).toBe('"apple"');
			const trigger = queryTrigger();
			await expect.poll(() => document.activeElement).toBe(trigger);
			await expect.poll(() => trigger.getAttribute('data-focus-visible')).toBe('true');
			expect(trigger.getAttribute('data-focused')).toBe('true');
			expectNoFalseFocusAttributes();
		});

		it('selects the focused option and closes on Alt+ArrowUp', async () => {
			const onChange = vi.fn();
			render(SelectTest, { onChange });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Banana');

			await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).toHaveBeenCalledWith('banana');
			expect(valueText()).toBe('"banana"');
			await expect.poll(() => document.activeElement).toBe(queryTrigger());
		});

		it('closes on Tab and moves the focus past the trigger without a change', async () => {
			const onChange = vi.fn();
			render(SelectTest, { onChange });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			await userEvent.keyboard('{Tab}');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			await expect
				.poll(() => (document.activeElement as HTMLElement | null)?.dataset.testid)
				.toBe('after');
			expect(onChange).not.toHaveBeenCalled();
			expect(queryRoot().hasAttribute('data-focus-within')).toBe(false);
			expectNoFalseFocusAttributes();
		});

		it('moves the focus ten options with PageDown and PageUp', async () => {
			render(SelectTest);
			await openWithKeyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');

			await userEvent.keyboard('{PageDown}');
			await expect.poll(() => focusedOptionText()).toBe('Pear');

			await userEvent.keyboard('{PageDown}');
			await expect.poll(() => focusedOptionText()).toBe('Plum');

			await userEvent.keyboard('{PageUp}');
			await expect.poll(() => focusedOptionText()).toBe('Banana');

			await userEvent.keyboard('{PageUp}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');
		});

		it('searches the options with typed characters, and the same character cycles', async () => {
			render(SelectTest);
			await openWithKeyboard('{ArrowDown}');

			await userEvent.keyboard('p');
			await expect.poll(() => focusedOptionText()).toBe('Peach');
			await userEvent.keyboard('p');
			await expect.poll(() => focusedOptionText()).toBe('Pear');
			await userEvent.keyboard('p');
			await expect.poll(() => focusedOptionText()).toBe('Plum');
		});

		it('stops at the ends of the list unless loop is set', async () => {
			render(SelectTest);
			await openWithKeyboard('{ArrowUp}');
			await expect.poll(() => focusedOptionText()).toBe('Plum');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Plum');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenListbox()).toBeNull();
		});

		it('wraps at the ends of the list with loop', async () => {
			render(SelectTest, { loop: true });
			await openWithKeyboard('{ArrowUp}');
			await expect.poll(() => focusedOptionText()).toBe('Plum');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');
		});

		it('skips disabled options and refuses to select them', async () => {
			const onChange = vi.fn();
			render(SelectTest, { disabledKeys: ['banana'], onChange });
			await openWithKeyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');

			const banana = document.querySelector<HTMLElement>('[data-item-id="banana"]')!;
			expect(banana.getAttribute('aria-disabled')).toBe('true');

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Blueberry');

			// A real pointer refuses a disabled element, so the click is dispatched by hand.
			banana.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(onChange).not.toHaveBeenCalled();
			expect(queryOpenListbox()).toBeTruthy();
		});

		it('closes on a second selection of the same option', async () => {
			const onChange = vi.fn();
			render(SelectTest, { defaultValue: 'apple', onChange });
			await openWithKeyboard('{ArrowDown}');
			await expect.poll(() => focusedOptionText()).toBe('Apple');

			await userEvent.keyboard('{Enter}');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).not.toHaveBeenCalled();
			expect(valueText()).toBe('"apple"');
		});
	});

	describe('Pointer', () => {
		it('opens on click, focuses the selected option without a ring, and selects on click', async () => {
			const onChange = vi.fn();
			render(SelectTest, { defaultValue: 'kiwi', onChange });
			const trigger = queryTrigger();

			await userEvent.click(trigger);
			await expect.poll(() => queryOpenListbox()).toBeTruthy();
			await expect.poll(() => focusedOptionText()).toBe('Kiwi');
			const kiwi = document.activeElement as HTMLElement;
			expect(kiwi.getAttribute('data-focused')).toBe('true');
			expect(kiwi.hasAttribute('data-focus-visible')).toBe(false);
			expect(queryRoot().getAttribute('data-focus-within')).toBe('true');
			expect(queryRoot().hasAttribute('data-focus-visible')).toBe(false);

			await userEvent.click(document.querySelector<HTMLElement>('[data-item-id="lemon"]')!);

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).toHaveBeenCalledWith('lemon');
			await expect.poll(() => triggerText()).toBe('Lemon');
			await expect.poll(() => document.activeElement).toBe(trigger);
			expect(trigger.getAttribute('data-focused')).toBe('true');
			expect(trigger.hasAttribute('data-focus-visible')).toBe(false);
			expectNoFalseFocusAttributes();
		});

		it('closes on a second click of the trigger', async () => {
			render(SelectTest);
			const trigger = queryTrigger();

			await userEvent.click(trigger);
			await expect.poll(() => queryOpenListbox()).toBeTruthy();
			await userEvent.click(trigger);
			await expect.poll(() => queryOpenListbox()).toBeNull();
		});

		it('closes on an outside press and leaves the focus where the user put it', async () => {
			const onChange = vi.fn();
			render(SelectTest, { onChange });
			await userEvent.click(queryTrigger());
			await expect.poll(() => queryOpenListbox()).toBeTruthy();

			const after = document.querySelector<HTMLButtonElement>('[data-testid="after"]')!;
			await userEvent.click(after);

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).not.toHaveBeenCalled();
			await expect.poll(() => document.activeElement).toBe(after);
			expect(queryTrigger().hasAttribute('data-focused')).toBe(false);
			expect(queryRoot().hasAttribute('data-focus-within')).toBe(false);
			expectNoFalseFocusAttributes();
		});

		it('returns the focus to the trigger after an outside press on nothing focusable', async () => {
			const onChange = vi.fn();
			render(SelectTest, { onChange });
			await userEvent.click(queryTrigger());
			await expect.poll(() => queryOpenListbox()).toBeTruthy();

			// A press on the background leaves the focus on the body, and a keyboard user would
			// have nowhere to continue from. Base UI and React Aria return it to the trigger.
			await userEvent.click(document.querySelector<HTMLElement>('[data-testid="value"]')!);

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).not.toHaveBeenCalled();
			const trigger = queryTrigger();
			await expect.poll(() => document.activeElement).toBe(trigger);
			expect(trigger.getAttribute('data-focused')).toBe('true');
			expect(trigger.hasAttribute('data-focus-visible')).toBe(false);
			expect(queryRoot().getAttribute('data-focus-within')).toBe('true');

			// And the keyboard opens it again from there.
			await userEvent.keyboard(' ');
			await expect.poll(() => queryOpenListbox()).toBeTruthy();
			expectNoFalseFocusAttributes();
		});

		it('focuses the trigger from its label', async () => {
			render(SelectTest);
			const label = document.querySelector<HTMLLabelElement>('[data-select-label]')!;
			await userEvent.click(label);
			await expect.poll(() => document.activeElement).toBe(queryTrigger());
			expect(queryListbox()).toBeNull();
		});

		// The modality can change while the trigger already holds focus, and no focus event
		// fires to report it. A key that the component ignores must bring the ring back.
		it('shows the focus ring when a key press follows a pointer press', async () => {
			render(SelectTest);
			const trigger = queryTrigger();
			const root = queryRoot();

			await userEvent.click(trigger);
			await expect.poll(() => queryOpenListbox()).toBeTruthy();
			await userEvent.click(trigger);
			await expect.poll(() => queryOpenListbox()).toBeNull();
			await expect.poll(() => trigger.getAttribute('data-focused')).toBe('true');
			expect(trigger.hasAttribute('data-focus-visible')).toBe(false);
			expect(root.hasAttribute('data-focus-visible')).toBe(false);

			await userEvent.keyboard('{F9}');

			await expect.poll(() => trigger.getAttribute('data-focus-visible')).toBe('true');
			await expect.poll(() => root.getAttribute('data-focus-visible')).toBe('true');
			expectFocusVisibleImpliesFocusWithin(root);
			expectFocusVisibleImpliesFocused(trigger);
		});
	});

	describe('Value', () => {
		it('shows the placeholder, then the text of the selection', async () => {
			render(SelectTest, { placeholder: 'Pick one' });
			const value = document.querySelector<HTMLElement>('[data-select-value]')!;
			expect(value.textContent?.trim()).toBe('Pick one');
			expect(value.getAttribute('data-placeholder')).toBe('true');
			expect(queryTrigger().getAttribute('data-placeholder')).toBe('true');

			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => value.textContent?.trim()).toBe('Apple');
			expect(value.hasAttribute('data-placeholder')).toBe(false);
		});

		it('reads the text of a selection from items while the popover is closed', async () => {
			render(SelectTest, { withItems: true, defaultValue: 'cherry' });
			expect(triggerText()).toBe('Cherry');
		});

		it('falls back to the key while the popover was never open and there are no items', async () => {
			render(SelectTest, { defaultValue: 'cherry' });
			expect(triggerText()).toBe('cherry');
			await openWithKeyboard('{ArrowDown}');
			await expect.poll(() => triggerText()).toBe('Cherry');
		});

		it('follows a value that the parent changes', async () => {
			const screen = render(SelectTest, { withItems: true, value: 'apple' });
			expect(triggerText()).toBe('Apple');
			await screen.rerender({ withItems: true, value: 'mango' });
			await expect.poll(() => triggerText()).toBe('Mango');
		});

		it('reports a change and keeps the value of a controlled parent', async () => {
			const onChange = vi.fn();
			render(SelectTest, { withItems: true, value: 'apple', controlledValue: true, onChange });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(onChange).toHaveBeenCalledWith('banana');
			expect(triggerText()).toBe('Apple');
		});

		it('keeps the popover closed when the consumer cancels the open', async () => {
			render(SelectTest, {
				onOpenChange: (open, details) => {
					if (open) details.cancel();
				}
			});
			queryTrigger().focus();
			await userEvent.keyboard('{ArrowDown}');
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(queryListbox()).toBeNull();
			expect(queryTrigger().getAttribute('aria-expanded')).toBe('false');
		});

		it('reports the reason of each close', async () => {
			const onOpenChange = vi.fn();
			render(SelectTest, { onOpenChange });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenListbox()).toBeNull();
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => queryOpenListbox()).toBeNull();
			await userEvent.click(queryTrigger());
			await expect.poll(() => queryOpenListbox()).toBeTruthy();
			await userEvent.click(queryTrigger());
			await expect.poll(() => queryOpenListbox()).toBeNull();

			const reasons = onOpenChange.mock.calls.map(([open, details]) => `${open}:${details.reason}`);
			expect(reasons).toEqual([
				'true:trigger-press',
				'false:escape-key',
				'true:trigger-press',
				'false:item-select',
				'true:trigger-press',
				'false:trigger-press'
			]);
		});
	});

	describe('Multiple selection', () => {
		it('keeps the list open, toggles options, and reports an array', async () => {
			const onChange = vi.fn();
			render(SelectTest, { selectionMode: 'multiple', onChange });
			await openWithKeyboard('{ArrowDown}');
			expect(queryListbox()!.getAttribute('aria-multiselectable')).toBe('true');

			await userEvent.keyboard('{Enter}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard(' ');

			expect(queryOpenListbox()).toBeTruthy();
			expect(onChange).toHaveBeenLastCalledWith(['apple', 'banana']);
			await expect.poll(() => triggerText()).toBe('Apple, Banana');

			await userEvent.keyboard('{ArrowUp}');
			await userEvent.keyboard('{Enter}');
			expect(onChange).toHaveBeenLastCalledWith(['banana']);
			await expect.poll(() => triggerText()).toBe('Banana');

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenListbox()).toBeNull();
			expect(valueText()).toBe('["banana"]');
		});
	});

	describe('Forms', () => {
		it('submits the selected key under the name', async () => {
			render(SelectFormTest, { defaultValue: 'banana' });
			await userEvent.click(document.querySelector<HTMLElement>('[data-testid="submit"]')!);
			await expect
				.poll(() => document.querySelector('[data-testid="submitted"]')?.textContent)
				.toBe('["banana"]');
		});

		it('submits every selected key in the multiple mode', async () => {
			render(SelectFormTest, { selectionMode: 'multiple', defaultValue: ['apple', 'cherry'] });
			await userEvent.click(document.querySelector<HTMLElement>('[data-testid="submit"]')!);
			await expect
				.poll(() => document.querySelector('[data-testid="submitted"]')?.textContent)
				.toBe('["apple","cherry"]');
		});

		it('blocks the submission of a required select without a value, and hands the focus to the trigger', async () => {
			render(SelectFormTest, { required: true });
			await userEvent.click(document.querySelector<HTMLElement>('[data-testid="submit"]')!);

			await expect
				.poll(() => document.querySelector('[data-testid="invalid-count"]')?.textContent)
				.toBe('1');
			expect(document.querySelector('[data-testid="submit-count"]')?.textContent).toBe('0');
			await expect.poll(() => document.activeElement).toBe(queryTrigger());
		});

		it('submits a required select once it has a value', async () => {
			render(SelectFormTest, { required: true });
			await openWithKeyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => queryOpenListbox()).toBeNull();

			await userEvent.click(document.querySelector<HTMLElement>('[data-testid="submit"]')!);
			await expect
				.poll(() => document.querySelector('[data-testid="submitted"]')?.textContent)
				.toBe('["apple"]');
		});
	});

	describe('Focus contract', () => {
		it('shows one focus state for the trigger and the list', async () => {
			render(SelectTest);
			const root = queryRoot();
			const trigger = queryTrigger();

			trigger.focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => queryOpenListbox()).toBeTruthy();
			await expect.poll(() => focusedOptionText()).toBe('Apple');
			expect(root.getAttribute('data-focus-within')).toBe('true');
			await expect.poll(() => root.getAttribute('data-focus-visible')).toBe('true');
			expectFocusVisibleImpliesFocusWithin(root);
			expectFocusVisibleImpliesFocused(document.activeElement as HTMLElement);

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => document.activeElement).toBe(trigger);
			expect(root.getAttribute('data-focus-within')).toBe('true');
			await expect.poll(() => root.getAttribute('data-focus-visible')).toBe('true');

			await userEvent.keyboard('{Tab}');
			await expect.poll(() => root.hasAttribute('data-focus-within')).toBe(false);
			expect(root.hasAttribute('data-focus-visible')).toBe(false);
			expectNoFalseFocusAttributes();
		});
	});
});
