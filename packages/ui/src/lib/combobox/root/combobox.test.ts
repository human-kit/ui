import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from './combobox-test.svelte';
import ComboBoxFormTest from './combobox-form-test.svelte';
import ComboBoxControlledExternalTest from './combobox-controlled-external-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

describe('ComboBox', () => {
	describe('Keyboard Navigation', () => {
		it('opens popover and focuses first item on ArrowDown', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('opens popover on ArrowUp', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowUp}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('opens popover on Enter without submitting the parent form', async () => {
			const screen = render(ComboBoxFormTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{Enter}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			await expect
				.poll(() => document.querySelector('[data-testid="submit-count"]')?.textContent)
				.toBe('0');
		});

		it('navigates down through items with ArrowDown when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and focus first item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Navigate down
			await userEvent.keyboard('{ArrowDown}');

			// aria-activedescendant should be set
			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
		});

		it('marks the virtually focused item as focus-visible during keyboard navigation', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			await expect
				.poll(() => {
					const activeDescendant = input.element().getAttribute('aria-activedescendant');
					if (!activeDescendant) return null;

					return document.getElementById(activeDescendant)?.getAttribute('data-focus-visible');
				})
				.toBe('true');
		});

		it('navigates up through items with ArrowUp when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Navigate down twice
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Navigate up
			await userEvent.keyboard('{ArrowUp}');

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
		});

		it('focuses first item on Home key', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover and navigate down
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Press Home
			await userEvent.keyboard('{Home}');

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			// Should contain first item ID
			expect(activeDescendant).toMatch(/combobox-item-.*-ar/);
		});

		it('focuses last item on End key', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Press End
			await userEvent.keyboard('{End}');

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			// Should contain last item ID (us = United States)
			expect(activeDescendant).toMatch(/combobox-item-.*-us/);
		});

		it('jumps multiple items on PageDown', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover and focus first
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Press PageDown
			await userEvent.keyboard('{PageDown}');

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
		});

		it('jumps multiple items on PageUp', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover and go to last
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{End}');

			// Press PageUp
			await userEvent.keyboard('{PageUp}');

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
		});

		it('focuses selected item on ArrowDown when selection exists', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open, select Brazil (second item), and close
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Verify selection and that it's closed
			await expect.element(input).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Re-open with click (trigger=press opens on click)
			await input.click();

			// Navigate to Brazil and select it
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Verify Brazil is selected
			await expect.element(input).toHaveValue('Brazil');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Now re-open and press ArrowDown - should focus the selected item first
			await input.click();

			// The combobox is already open and should auto-focus Brazil
			// Wait a moment for the focus to settle
			await new Promise((r) => setTimeout(r, 50));

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
			expect(activeDescendant).toMatch(/combobox-item-.*-br/); // 'br' is Brazil's ID
		});

		it('focuses selected item on ArrowUp when selection exists', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open, navigate to Brazil, select it, and close
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Verify selection and that it's closed
			await expect.element(input).toHaveValue('Brazil');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Now re-open with click - should auto-focus Brazil
			await input.click();

			// Wait a moment for the focus to settle
			await new Promise((r) => setTimeout(r, 50));

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
			expect(activeDescendant).toMatch(/combobox-item-.*-br/); // 'br' is Brazil's ID
		});

		it('auto-focuses selection when opening popover with focus trigger', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Select an item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Blur and refocus
			input.element().blur();
			await input.click();

			// Should auto-focus the selected item (Brazil)
			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
			expect(activeDescendant).toMatch(/combobox-item-.*-br/);
		});

		it('navigates from selection immediately without double-press', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Select Brazil (second item)
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Blur and refocus
			input.element().blur();
			await input.click();

			// First arrow press should already move from selection
			await userEvent.keyboard('{ArrowDown}');
			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();
			// Should be on Canada (third item), not Brazil
			expect(activeDescendant).toMatch(/combobox-item-.*-ca/);
		});

		it('resets focus when pressing left arrow', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate to second item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Verify an item is focused
			let activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();

			// Press left arrow
			await userEvent.keyboard('{ArrowLeft}');

			// Focus should be reset (no active descendant)
			activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeFalsy();
		});

		it('resets focus when pressing right arrow', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate to second item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');

			// Verify an item is focused
			let activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeTruthy();

			// Press right arrow
			await userEvent.keyboard('{ArrowRight}');

			// Focus should be reset (no active descendant)
			activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toBeFalsy();
		});
	});

	describe('Selection', () => {
		it('uses null as the default empty value in single mode', async () => {
			render(ComboBoxTest);

			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('null');
		});

		it('selects focused item on Enter and closes popover', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate to first item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Select with Enter
			await userEvent.keyboard('{Enter}');

			// Popover should close
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Input should have selected label
			await expect.element(input).toHaveValue('Argentina');
		});

		it('updates input value with selected item label', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open, navigate to second item, and select
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input).toHaveValue('Brazil');
		});

		it('shows selected item label from defaultValue on mount', async () => {
			const screen = render(ComboBoxTest, { defaultValue: 'br' });
			const input = screen.getByRole('combobox');

			await expect.element(input).toHaveValue('Brazil');
		});

		it('shows selected item label from controlled value on mount', async () => {
			const screen = render(ComboBoxTest, { initialValue: 'br' });
			const input = screen.getByRole('combobox');

			await expect.element(input).toHaveValue('Brazil');
			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('br');
		});

		it('deselects when input is cleared', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select an item first
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Clear input by triple-clicking to select all and deleting
			await input.tripleClick();
			await userEvent.keyboard('{Backspace}');

			await expect.element(input).toHaveValue('');
			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('null');
		});

		it('calls onChange with null when single selection is cleared', async () => {
			const onValueChange = vi.fn();
			const screen = render(ComboBoxTest, { onValueChange });
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			expect(onValueChange).toHaveBeenLastCalledWith('ar');

			await input.tripleClick();
			await userEvent.keyboard('{Backspace}');

			expect(onValueChange).toHaveBeenLastCalledWith(null);
		});

		it('retains input focus after mouse selection', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Find and click an item
			const item = screen.getByRole('option', { name: 'Argentina' });
			await item.click();

			// Input should still have focus
			expect(document.activeElement).toBe(input.element());
		});
	});

	describe('Blur/Escape Behavior', () => {
		it('closes popover on Escape', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Press Escape
			await userEvent.keyboard('{Escape}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('restores selection label on Escape when item is selected', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select an item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input).toHaveValue('Argentina');

			// Type something different (select all first via triple-click, then type)
			await input.tripleClick();
			await userEvent.keyboard('test');

			// Press Escape - should restore selection
			await userEvent.keyboard('{Escape}');

			await expect.element(input).toHaveValue('Argentina');
		});

		it('clears input on Escape when no selection exists', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Type without selecting
			await input.click();
			await userEvent.keyboard('test');

			// Press Escape
			await userEvent.keyboard('{Escape}');

			await expect.element(input).toHaveValue('');
		});

		it('keeps controlled inputValue after external value sync when opening and blurring', async () => {
			const screen = render(ComboBoxControlledExternalTest);
			const input = screen.getByRole('combobox');

			await expect.element(input).toHaveValue('CAJA X 5000');

			await screen.getByTestId('sync-external-value').click();

			await expect.element(input).toHaveValue('Unidad');

			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			await expect
				.poll(() => document.querySelector('[data-item-id="unit"]')?.getAttribute('aria-selected'))
				.toBe('true');
			await expect
				.poll(() =>
					document.querySelector('[data-item-id="box-5000"]')?.getAttribute('aria-selected')
				)
				.toBe('false');

			await userEvent.keyboard('{Escape}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			await expect.element(input).toHaveValue('Unidad');
		});

		it('fires onOpenChange(false) only once per Escape', async () => {
			const onOpenChange = vi.fn();
			const screen = render(ComboBoxTest, { onOpenChange });
			const input = screen.getByRole('combobox');

			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			onOpenChange.mockClear();

			await userEvent.keyboard('{Escape}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Give the popover's deferred close callback a chance to run,
			// then ensure it did not produce a duplicate notification.
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(onOpenChange.mock.calls.filter(([open]) => open === false)).toHaveLength(1);
		});

		it('restores the selected label on blur after selecting via click and typing', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select Argentina with the pointer (mousedown inside the popover marks
			// a pointer-down that must not linger after the click completes)
			await input.click();
			const listbox = screen.getByRole('listbox').element();
			const firstOption = listbox.querySelector(
				'[role="option"]:not([data-empty-placeholder])'
			) as HTMLElement;
			await userEvent.click(firstOption);

			await expect.element(input).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Type a non-matching query, then move focus out
			await input.tripleClick();
			await userEvent.keyboard('xyz');
			await expect.element(input).toHaveValue('xyz');

			await userEvent.keyboard('{Tab}');

			// A stale popover pointer-down marker must not swallow this blur:
			// the input restores the selected label.
			await expect.element(input).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('Popover Opening', () => {
		it('keeps arrow navigation working when reopening right after closing', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Close and immediately reopen while the exit animation may still be
			// running (items stay mounted and registered through the animation)
			await userEvent.keyboard('{Escape}');
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => input.element().getAttribute('aria-activedescendant')).toBeTruthy();
		});

		it('opens on click when trigger is press (default)', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('opens on typing when trigger is press', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Focus without clicking (use keyboard navigation)
			input.element().focus();
			await userEvent.keyboard('a');

			// Should open (all trigger modes open on typing)
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Disabled State', () => {
		it('does not open when disabled', async () => {
			const screen = render(ComboBoxTest, { disabled: true });
			const input = screen.getByRole('combobox');

			await userEvent.keyboard('{ArrowDown}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('input has disabled attribute when disabled is true', async () => {
			const screen = render(ComboBoxTest, { disabled: true });
			const input = screen.getByRole('combobox');

			await expect.element(input).toBeDisabled();
		});

		it('sets pending state attributes on the root when pending is true', async () => {
			render(ComboBoxTest, { pending: true });
			const root = document.querySelector('[data-combobox]');

			expect(root?.getAttribute('data-pending')).toBe('true');
			expect(root?.getAttribute('aria-busy')).toBe('true');
		});
	});

	describe('Automatic Filtering', () => {
		it('filters items based on input value', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// All items should be visible initially
			const allItems = screen.getByRole('listbox').element().querySelectorAll('[role="option"]');
			expect(allItems.length).toBeGreaterThan(1);

			// Type to filter
			await userEvent.keyboard('arg');

			// Only matching items should be visible
			const filteredItems = screen
				.getByRole('listbox')
				.element()
				.querySelectorAll('[role="option"]');
			expect(filteredItems.length).toBe(1); // Only "Argentina" matches "arg"
		});

		it('shows all items when input is empty', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// All items should be visible
			const items = screen.getByRole('listbox').element().querySelectorAll('[role="option"]');
			expect(items.length).toBeGreaterThan(5); // We have 10 countries in the test
		});

		it('shows empty placeholder when no items match filter', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Type something that doesn't match any item
			await userEvent.keyboard('xyz123');

			// Should show empty placeholder
			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBe(0);

			// Empty placeholder should be visible
			const placeholder = listbox.querySelector('[data-empty-placeholder]');
			expect(placeholder).toBeTruthy();
		});

		it('closes combobox when input loses focus', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover and type something that doesn't match
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('xyz123');

			// Verify popover is open
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Blur the input (simulates clicking outside)
			input.element().blur();

			// Combobox should be closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('Accessibility - ARIA Attributes', () => {
		it('has correct ARIA attributes on input', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Basic combobox ARIA
			await expect.element(input).toHaveAttribute('role', 'combobox');
			await expect.element(input).toHaveAttribute('aria-haspopup', 'listbox');
			await expect.element(input).toHaveAttribute('aria-autocomplete', 'list');
			await expect.element(input).toHaveAttribute('autocomplete', 'new-password');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('updates aria-expanded when popover opens/closes', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Initially closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Open with arrow
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Close with escape
			await userEvent.keyboard('{Escape}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('uses provided id for internal ARIA linkage', async () => {
			const screen = render(ComboBoxTest, { id: 'country-picker' });
			const input = screen.getByRole('combobox');

			// Open and focus an item so aria-controls/aria-activedescendant are populated
			// (aria-controls is only exposed while the listbox exists, i.e. expanded).
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			await expect
				.element(input)
				.toHaveAttribute('aria-controls', 'combobox-listbox-country-picker');

			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant).toMatch(/^combobox-item-country-picker-/);
		});

		it('has correct ARIA attributes on listbox', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toHaveAttribute('role', 'listbox');
		});

		it('updates aria-activedescendant during navigation', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Initially no active descendant
			expect(input.element().getAttribute('aria-activedescendant')).toBeFalsy();

			// Open and navigate
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Should have active descendant after first arrow
			const firstDescendant = input.element().getAttribute('aria-activedescendant');
			expect(firstDescendant).toBeTruthy();

			// Navigate down, should change
			await userEvent.keyboard('{ArrowDown}');
			const secondDescendant = input.element().getAttribute('aria-activedescendant');
			expect(secondDescendant).toBeTruthy();
			expect(secondDescendant).not.toBe(firstDescendant);
		});

		it('clears aria-activedescendant when popover closes', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			expect(input.element().getAttribute('aria-activedescendant')).toBeTruthy();

			// Close
			await userEvent.keyboard('{Escape}');
			expect(input.element().getAttribute('aria-activedescendant')).toBeFalsy();
		});

		it('items have correct role="option"', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]');
			expect(options.length).toBeGreaterThan(0);
		});
	});

	describe('Edge Cases', () => {
		it('handles rapid typing without errors', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Type rapidly
			await userEvent.keyboard('argbrcafr');

			// Should not crash, should filter
			const listbox = screen.getByRole('listbox').element();
			expect(listbox).toBeTruthy();
		});

		it('handles whitespace-only input', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('   ');

			// Should show all items (whitespace is trimmed in filter)
			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(0);
		});

		it('handles backspace to clear filter', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('arg');

			// Should filter to Argentina
			let listbox = screen.getByRole('listbox').element();
			let options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBe(1);

			// Clear with backspace
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}');

			// Should show all items again
			listbox = screen.getByRole('listbox').element();
			options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(1);
		});

		it('restores selection on Escape after modifying input', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select an item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Get selected value
			const selectedValue = (input.element() as HTMLInputElement).value;
			expect(selectedValue).toBeTruthy();

			// Open again and type something else (without clearing)
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('xyz');

			// Input now has different value
			expect((input.element() as HTMLInputElement).value).toContain('xyz');

			// Escape should restore the original selection
			await userEvent.keyboard('{Escape}');

			// Should restore the selected value
			const restoredValue = (input.element() as HTMLInputElement).value;
			expect(restoredValue).toBe(selectedValue);
		});
	});

	describe('Filtering API', () => {
		it('uses the default contains filter when no filter prop is provided', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('arg');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');

			expect(options.length).toBe(1);
			expect(options[0].textContent).toContain('Argentina');
		});

		it('uses a custom filter when provided', async () => {
			const filter = vi.fn((textValue: string, inputValue: string) => {
				return inputValue.trim() === 'remote' && textValue === 'Brazil';
			});
			const screen = render(ComboBoxTest, { filter });
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('remote');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');

			expect(options.length).toBe(1);
			expect(options[0].textContent).toContain('Brazil');
			expect(filter).toHaveBeenCalledWith('Brazil', 'remote');
		});

		it('does not filter locally when filter is null', async () => {
			const screen = render(ComboBoxTest, { filter: null });
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('arg');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');

			expect(options.length).toBe(10);
		});

		it('supports externally filtered items that do not match the input when filter is null', async () => {
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const screen = render(ComboBoxFilteredTest, {
				filter: null,
				externalFilterMode: 'remote'
			});
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('remote');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');

			expect(options.length).toBe(1);
			expect(options[0].textContent).toContain('Brazil');
		});
	});

	describe('Disabled and ReadOnly States', () => {
		it('does not open when disabled', async () => {
			const screen = render(ComboBoxTest, { disabled: true });
			const input = screen.getByRole('combobox');

			// Try to focus and type - should not open
			input.element().focus();
			await userEvent.keyboard('{ArrowDown}');

			// Should remain closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('does not open when readonly', async () => {
			const screen = render(ComboBoxTest, { readonly: true });
			const input = screen.getByRole('combobox');

			// Try to focus and type - should not open
			input.element().focus();
			await userEvent.keyboard('{ArrowDown}');

			// Should remain closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('input is disabled when ComboBox is disabled', async () => {
			const screen = render(ComboBoxTest, { disabled: true });
			const input = screen.getByRole('combobox');

			await expect.element(input).toHaveAttribute('disabled');
		});

		it('input is readonly when ComboBox is readonly', async () => {
			const screen = render(ComboBoxTest, { readonly: true });
			const input = screen.getByRole('combobox');

			await expect.element(input).toHaveAttribute('readonly');
		});

		it('keeps input focus after clicking a disabled option so arrow navigation still works', async () => {
			const screen = render(ComboBoxTest, { disabledKeys: ['br'] });
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			const activeDescendantBeforeClick = input.element().getAttribute('aria-activedescendant');

			const disabledOption = screen.getByRole('option', { name: 'Brazil' });
			disabledOption
				.element()
				.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
			disabledOption
				.element()
				.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

			expect(document.activeElement).toBe(input.element());
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			await userEvent.keyboard('{ArrowDown}');

			expect(document.activeElement).toBe(input.element());
			expect(input.element().getAttribute('aria-activedescendant')).not.toBeNull();
			expect(input.element().getAttribute('aria-activedescendant')).not.toBe(
				activeDescendantBeforeClick
			);
		});

		it('keeps input focus after clicking the listbox gap and can still close without focus errors', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			listbox
				.element()
				.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
			listbox.element().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

			expect(document.activeElement).toBe(input.element());
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(input.element());

			await userEvent.keyboard('{Escape}');

			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			expect(consoleError).not.toHaveBeenCalled();

			consoleError.mockRestore();
		});
	});

	describe('Selection Behavior', () => {
		it('Enter key selects focused item', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open and navigate to first item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Select with Enter
			await userEvent.keyboard('{Enter}');

			// Popover should close
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Input should have selected value
			const value = (input.element() as HTMLInputElement).value;
			expect(value).toBeTruthy();
		});

		it('click on item selects it', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			// Click on first option
			const listbox = screen.getByRole('listbox').element();
			const firstOption = listbox.querySelector(
				'[role="option"]:not([data-empty-placeholder])'
			) as HTMLElement;
			await userEvent.click(firstOption);

			// Popover should close and input should have value
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			const value = (input.element() as HTMLInputElement).value;
			expect(value).toBeTruthy();
		});

		it('Escape key closes popover and restores input', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select an item first
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			const selectedValue = (input.element() as HTMLInputElement).value;

			// Open again and type
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('xyz');

			// Press Escape
			await userEvent.keyboard('{Escape}');

			// Should close and restore
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			expect((input.element() as HTMLInputElement).value).toBe(selectedValue);
		});

		it('clearing input clears selection', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select an item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			expect((input.element() as HTMLInputElement).value).toBeTruthy();

			// Clear input manually
			await input.click();
			await userEvent.keyboard('{Control>}a{/Control}{Backspace}');

			// Input should be empty
			expect((input.element() as HTMLInputElement).value).toBe('');
		});
	});

	describe('Trigger Modes', () => {
		it('trigger="focus" opens popover on focus', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Focus the input
			await input.click();

			// Should open immediately
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('trigger="input" opens popover only when typing', async () => {
			const screen = render(ComboBoxTest, { trigger: 'input' });
			const input = screen.getByRole('combobox');

			// Focus without typing
			await input.click();

			// Should not open yet
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Type something
			await userEvent.keyboard('a');

			// Now should open
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('trigger="press" opens on input', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');

			// Focus and type - should open (all trigger modes open on typing)
			input.element().focus();
			await userEvent.keyboard('argentina');

			// Should open
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('trigger="press" opens on click/press', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');

			// Click to open
			await input.click();

			// Should open
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
		});

		it('trigger="focus" closes on blur and stays closed', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Focus the input - should open
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Blur the input
			input.element().blur();

			// Should close and stay closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Verify it doesn't re-open automatically
			await new Promise((resolve) => setTimeout(resolve, 100));
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('trigger="focus" closes on click outside and stays closed', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Focus to open
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Simulate clicking outside by blurring
			input.element().blur();

			// Should close
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Wait a bit to ensure it doesn't re-open
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should still be closed (this would fail with the old bug)
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});

		it('trigger="focus" closes on Escape and stays closed', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Focus to open
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Press Escape
			await userEvent.keyboard('{Escape}');

			// Should close
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Verify it stays closed
			await new Promise((resolve) => setTimeout(resolve, 100));
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('Filter Reset Behavior', () => {
		it('shows all items when re-opening with a selection', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Open and select an item
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Verify selection and closed
			await expect.element(input).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Blur and re-focus to trigger focus event
			input.element().blur();
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Should show ALL items, not just Argentina
			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(1); // Should have all 10 countries
		});

		it('filters immediately when typing after re-opening with selection', async () => {
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const screen = render(ComboBoxFilteredTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Select Argentina
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Blur and re-focus
			input.element().blur();
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Verify all items are shown
			let listbox = screen.getByRole('listbox').element();
			let options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(1);

			// Start typing - first select all existing text
			await userEvent.keyboard('{Control>}a{/Control}'); // Select all
			await userEvent.keyboard('braz'); // This replaces selected text

			// Should filter to Brazil
			listbox = screen.getByRole('listbox').element();
			options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBe(1);
			expect(options[0].textContent).toContain('Brazil');
		});

		it('input displays selection while showing all items in dropdown', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Select Brazil
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input).toHaveValue('Brazil');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Blur and re-focus
			input.element().blur();
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Input STILL shows "Brazil"
			await expect.element(input).toHaveValue('Brazil');

			// But dropdown shows all items
			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(1);
		});

		it('filter resets each time combobox closes and reopens', async () => {
			const screen = render(ComboBoxTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			// Select Argentina
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await userEvent.keyboard('{Escape}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Re-open first time
			input.element().blur();
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			let listbox = screen.getByRole('listbox').element();
			let options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(1);

			// Close and re-open second time
			await userEvent.keyboard('{Escape}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			input.element().blur();
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			listbox = screen.getByRole('listbox').element();
			options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBeGreaterThan(1);
		});

		it('does not notify onInputChange with the selected label when choosing an option', async () => {
			const { vi } = await import('vitest');
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const onInputChangeMock = vi.fn();
			const screen = render(ComboBoxFilteredTest, {
				trigger: 'focus',
				onInputChange: onInputChangeMock
			});
			const input = screen.getByRole('combobox');

			await input.click();
			onInputChangeMock.mockClear();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			await expect.element(input).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			expect(onInputChangeMock).not.toHaveBeenCalledWith('Argentina');
		});

		it('does not collapse the first closing animation to only the selected option', async () => {
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const screen = render(ComboBoxFilteredTest, { trigger: 'focus' });
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			const listbox = screen.getByRole('listbox').element();

			await userEvent.keyboard('{Enter}');

			await expect
				.poll(() => {
					const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
					return options.length;
				})
				.toBeGreaterThan(1);
		});

		it('keeps the typed filter when typing opens the popover with a previous selection', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Select Argentina
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(input).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Replace the input content by typing "b" - the open caused by typing
			// must not reset the filter to show all items
			await userEvent.keyboard('{Control>}a{/Control}b');
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			const listbox = screen.getByRole('listbox').element();
			await expect
				.poll(() => {
					const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
					return options.length;
				})
				.toBe(1);
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options[0].textContent).toContain('Brazil');

			// Virtual focus must not remain on the previous selection
			const activeDescendant = input.element().getAttribute('aria-activedescendant');
			expect(activeDescendant ?? '').not.toMatch(/-ar$/);

			// Enter selects the first matching item, not the previous selection
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');
			await expect.element(input).toHaveValue('Brazil');
			await expect
				.poll(() => document.querySelector('[data-selected-value]')?.textContent)
				.toBe('br');
		});
	});

	describe('onInputChange Callback Behavior', () => {
		it('calls onInputChange with typed value when user types', async () => {
			const { vi } = await import('vitest');
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const onInputChangeMock = vi.fn();

			const screen = render(ComboBoxFilteredTest, {
				trigger: 'focus',
				onInputChange: onInputChangeMock
			});
			const input = screen.getByRole('combobox');

			// Open and type
			await input.click();
			onInputChangeMock.mockClear();

			await userEvent.keyboard('braz');

			// Should have been called with typed characters
			expect(onInputChangeMock).toHaveBeenCalled();
			const lastCall = onInputChangeMock.mock.calls[onInputChangeMock.mock.calls.length - 1];
			expect(lastCall[0]).toBe('braz');
		});

		it('shows all items then filters when typing after selection', async () => {
			const { vi } = await import('vitest');
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const onInputChangeMock = vi.fn();

			const screen = render(ComboBoxFilteredTest, {
				trigger: 'focus',
				onInputChange: onInputChangeMock
			});
			const input = screen.getByRole('combobox');

			// Select Argentina
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Re-open (should show all 10)
			input.element().blur();
			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			let listbox = screen.getByRole('listbox').element();
			let options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBe(10); // All countries

			// Type to filter - first clear the existing text
			onInputChangeMock.mockClear();
			await userEvent.keyboard('{Control>}a{/Control}'); // Select all
			await userEvent.keyboard('jap'); // This replaces selected text

			// Should filter to Japan only
			listbox = screen.getByRole('listbox').element();
			options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');
			expect(options.length).toBe(1);
			expect(options[0].textContent).toContain('Japan');

			// Verify callback was called
			expect(onInputChangeMock).toHaveBeenCalled();
		});

		it('filters when typing after selection without reopening manually', async () => {
			const { vi } = await import('vitest');
			const ComboBoxFilteredTest = (await import('./combobox-filtered-test.svelte')).default;
			const onInputChangeMock = vi.fn();

			const screen = render(ComboBoxFilteredTest, {
				trigger: 'focus',
				onInputChange: onInputChangeMock
			});
			const input = screen.getByRole('combobox');

			// Select Argentina
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Input should show "Argentina" and combobox is closed
			expect(input.element()).toHaveValue('Argentina');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Type to modify (this automatically opens due to typing)
			onInputChangeMock.mockClear();
			await userEvent.keyboard('{Backspace}{Backspace}{Backspace}'); // Remove "ina" -> "Argent"

			// Combobox should auto-open and filter
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			const listbox = screen.getByRole('listbox').element();
			const options = listbox.querySelectorAll('[role="option"]:not([data-empty-placeholder])');

			// Should show only Argentina (the only country matching "Argent")
			expect(options.length).toBe(1);
			expect(options[0].textContent).toContain('Argentina');

			// Verify the filter value was passed correctly
			expect(onInputChangeMock).toHaveBeenCalled();
			// Last call should be "Argent" not ""
			const calls = onInputChangeMock.mock.calls;
			const lastCall = calls[calls.length - 1];
			expect(lastCall[0]).toBe('Argent');
		});
	});

	describe('Focus Behavior', () => {
		it('allows input to lose focus when clicking outside with trigger="press"', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');
			const outsideButton = screen.getByTestId('outside-button');

			// Focus the input using focus() method (not click, which opens popover with trigger=press)
			input.element().focus();
			expect(document.activeElement).toBe(input.element());
			// Popover should still be closed
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Click outside (popover is closed so nothing is blocking)
			await outsideButton.click();

			// Input should lose focus
			expect(document.activeElement).not.toBe(input.element());
			expect(document.activeElement).toBe(outsideButton.element());
		});

		it('allows input to lose focus when clicking outside with trigger="input"', async () => {
			const screen = render(ComboBoxTest, { trigger: 'input' });
			const input = screen.getByRole('combobox');
			const outsideButton = screen.getByTestId('outside-button');

			// Focus the input (without typing so popover doesn't open)
			await input.click();
			expect(document.activeElement).toBe(input.element());

			// Click outside
			await outsideButton.click();

			// Input should lose focus
			expect(document.activeElement).not.toBe(input.element());
			expect(document.activeElement).toBe(outsideButton.element());
		});

		it('moves focus away from the input when clicking outside while the popover is open', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');
			const outsideButton = screen.getByTestId('outside-button');
			const wrapper = screen.getByRole('group');

			await input.click();
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			await expect.element(wrapper).toHaveAttribute('data-focus-within');

			outsideButton
				.element()
				.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			await expect.poll(() => document.activeElement).toBe(outsideButton.element());
			await expect.element(wrapper).not.toHaveAttribute('data-focus-within');
		});

		it('keeps focus on input after pressing Escape', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Press Escape
			await userEvent.keyboard('{Escape}');

			// Popover should close but input should keep focus
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');
			expect(document.activeElement).toBe(input.element());
		});

		it('keeps focus on input after selecting an item', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');

			// Open popover and select
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard('{Enter}');

			// Input should keep focus after selection
			expect(document.activeElement).toBe(input.element());
		});

		it('input can be blurred after popover closes with Escape', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');
			const outsideButton = screen.getByTestId('outside-button');

			// Open popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');

			// Close with Escape
			await userEvent.keyboard('{Escape}');
			await expect.element(input).toHaveAttribute('aria-expanded', 'false');

			// Now click outside - popover is closed so nothing blocks
			await outsideButton.click();

			// Focus should move to the button
			expect(document.activeElement).toBe(outsideButton.element());
		});

		it('exposes root focus contract attributes and never serializes false', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');
			const root = document.querySelector('[data-combobox]') as HTMLElement | null;

			expect(root).toBeTruthy();

			await input.click();
			await expect.poll(() => root?.getAttribute('data-focused')).toBe('true');
			await expect.poll(() => root?.getAttribute('data-focus-within')).toBe('true');
			expectNoFalseFocusAttributes(root ?? document);

			(input.element() as HTMLElement).blur();
			await expect.poll(() => root?.getAttribute('data-focused')).toBeNull();
			await expect.poll(() => root?.getAttribute('data-focus-within')).toBeNull();
			await expect.poll(() => root?.getAttribute('data-focus-visible')).toBeNull();
			expectNoFalseFocusAttributes(root ?? document);
		});

		it('shows focus-visible for keyboard focus and clears it on pointer click takeover', async () => {
			const screen = render(ComboBoxTest, { trigger: 'press' });
			const input = screen.getByRole('combobox');
			const root = document.querySelector('[data-combobox]') as HTMLElement | null;

			(input.element() as HTMLElement).focus();
			await userEvent.keyboard('{ArrowDown}');

			await expect.poll(() => root?.getAttribute('data-focus-visible')).toBe('true');

			await input.click();

			await expect.poll(() => root?.getAttribute('data-focus-visible')).toBeNull();
		});
	});

	describe('IME Composition', () => {
		it('ignores Enter while composing so no item is selected', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => input.element().getAttribute('aria-activedescendant')).toBeTruthy();

			input.element().dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'Enter',
					isComposing: true,
					bubbles: true,
					cancelable: true
				})
			);

			// Let any (incorrect) state update settle before asserting
			await new Promise((resolve) => setTimeout(resolve, 20));

			// Still open, nothing selected (single mode defaults the empty value to null)
			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			expect(document.querySelector('[data-selected-value]')?.textContent).toBe('null');
		});

		it('ignores arrow keys while composing so virtual focus does not move', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => input.element().getAttribute('aria-activedescendant')).toBeTruthy();
			const activeDescendant = input.element().getAttribute('aria-activedescendant');

			input.element().dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowDown',
					isComposing: true,
					bubbles: true,
					cancelable: true
				})
			);

			// Let any (incorrect) state update settle before asserting
			await new Promise((resolve) => setTimeout(resolve, 20));
			expect(input.element().getAttribute('aria-activedescendant')).toBe(activeDescendant);
		});
	});
});
