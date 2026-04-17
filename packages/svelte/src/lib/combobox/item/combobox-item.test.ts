import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';
import ComboBoxScrollableListTest from '../popover/combobox-scrollable-list-test.svelte';

describe('ComboBox.Item', () => {
	describe('Accessibility', () => {
		it('has role="option"', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(0);
		});

		it('has unique id for each item', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			const ids = Array.from(options).map((el) => el.id);
			const uniqueIds = new Set(ids);
			expect(ids.length).toBe(uniqueIds.size);
		});
	});

	describe('Selection state', () => {
		it('has aria-selected attribute', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			const firstOption = options[0];

			// Without selection, should be false
			expect(firstOption.getAttribute('aria-selected')).toBe('false');
		});

		it('updates aria-selected when selected', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate to first item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Select it
			await userEvent.keyboard('{Enter}');

			// Re-open to verify selection state
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			const selectedOptions = Array.from(options).filter(
				(el) => el.getAttribute('aria-selected') === 'true'
			);
			expect(selectedOptions.length).toBe(1);
		});

		it('has data-selected attribute when selected', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate to first item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Select it
			await userEvent.keyboard('{Enter}');

			// Re-open to verify data attribute
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			const selectedOptions = Array.from(options).filter((el) => el.hasAttribute('data-selected'));
			expect(selectedOptions.length).toBe(1);
		});
	});

	describe('Virtual Focus', () => {
		it('has data-focused when virtually focused', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const focusedOptions = listbox.querySelectorAll('[data-focused]');
			expect(focusedOptions.length).toBe(1);
		});

		it('moves focus when navigating with keyboard', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const firstFocused = listbox.querySelector('[data-focused]');
			const firstFocusedId = firstFocused?.id;

			// Navigate down
			await userEvent.keyboard('{ArrowDown}');

			const secondFocused = listbox.querySelector('[data-focused]');
			const secondFocusedId = secondFocused?.id;

			// Focus should have moved
			expect(secondFocusedId).not.toBe(firstFocusedId);
		});
	});

	describe('Interaction', () => {
		it('selects item on click', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Click on first option
			const listbox = screen.getByRole('listbox').element();
			const firstOption = listbox.querySelector(
				'[role="option"]:not([data-empty-placeholder])'
			) as HTMLElement;
			await firstOption.click();

			// Should close after selection
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Input should have value
			const inputValue = (input.element() as HTMLInputElement).value;
			expect(inputValue).toBeTruthy();
		});

		it('moves virtual focus to the hovered option and clears focus-visible from the previous one', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options[0].getAttribute('data-focus-visible')).toBe('true');

			await userEvent.hover(options[2] as HTMLElement);
			const updatedOptions = listbox.querySelectorAll(
				'[role="option"]:not([data-empty-placeholder])'
			);

			await expect
				.poll(() => input.element().getAttribute('aria-activedescendant'))
				.toBe(updatedOptions[2].id);
			await expect.poll(() => updatedOptions[0].getAttribute('data-focus-visible')).toBeNull();
			await expect.poll(() => updatedOptions[0].getAttribute('data-focused')).toBeNull();
			await expect.poll(() => updatedOptions[2].getAttribute('data-hovered')).toBe('true');
			await expect.poll(() => updatedOptions[2].getAttribute('data-focused')).toBe('true');
			await expect.poll(() => updatedOptions[2].getAttribute('data-focus-visible')).toBeNull();
		});

		it('does not scroll hovered options into view', async () => {
			const screen = render(ComboBoxScrollableListTest);
			const input = screen.getByRole('combobox');
			const scrollIntoViewSpy = vi
				.spyOn(HTMLElement.prototype, 'scrollIntoView')
				.mockImplementation(() => {});

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			scrollIntoViewSpy.mockClear();

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			const hoveredOption = options[options.length - 1] as HTMLElement;

			hoveredOption.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
			hoveredOption.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

			await expect
				.poll(() => input.element().getAttribute('aria-activedescendant'))
				.toBe(hoveredOption.id);
			expect(scrollIntoViewSpy).not.toHaveBeenCalled();

			scrollIntoViewSpy.mockRestore();
		});
	});
});
