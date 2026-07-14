import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ListBoxTest from './listbox-test.svelte';
import ListBoxBindValueTest from './listbox-bind-value-test.svelte';
import ListBoxControlledTest from './listbox-controlled-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

describe('ListBox', () => {
	describe('Accessibility', () => {
		it('has role="listbox"', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await expect.element(listbox).toBeInTheDocument();
		});

		it('has aria-label', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await expect.element(listbox).toHaveAttribute('aria-label', 'Fruits list');
		});

		it('has aria-multiselectable false for single mode', async () => {
			const screen = render(ListBoxTest, { selectionMode: 'single' });
			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'false');
		});

		it('has aria-multiselectable true for multiple mode', async () => {
			const screen = render(ListBoxTest, { selectionMode: 'multiple' });
			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'true');
		});

		it('has tabindex="0" for keyboard focus', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await expect.element(listbox).toHaveAttribute('tabindex', '0');
		});

		it('does not render the empty placeholder while static items are mounting', async () => {
			render(ListBoxTest);

			expect(document.querySelector('[data-empty-placeholder]')).toBeNull();
		});

		it('exposes root focus contract attributes during keyboard flow', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await expect.element(listbox).toHaveAttribute('data-focus-within', 'true');

			await userEvent.keyboard('{Home}');
			await expect.element(listbox).not.toHaveAttribute('data-focus-visible');

			(document.activeElement as HTMLElement | null)?.blur();
			await expect.poll(() => listbox.element()?.getAttribute('data-focus-within')).toBeNull();
		});
	});

	describe('Keyboard Navigation', () => {
		it('focuses an item on ArrowDown', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{ArrowDown}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption).toBeTruthy();
		});

		it('navigates through items with ArrowDown', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			// Use Home to ensure we start at first item
			await userEvent.keyboard('{Home}');

			const firstFocused = listbox.element().querySelector('[data-focused]');
			expect(firstFocused?.textContent).toContain('Apple');

			await userEvent.keyboard('{ArrowDown}');
			const secondFocused = listbox.element().querySelector('[data-focused]');
			expect(secondFocused?.textContent).toContain('Banana');
		});

		it('navigates up with ArrowUp', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			// Start at End and navigate up
			await userEvent.keyboard('{End}');
			await userEvent.keyboard('{ArrowUp}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Grape');
		});

		it('focuses first item on Home', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{End}'); // Go to last
			await userEvent.keyboard('{Home}'); // Go to first

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Apple');
		});

		it('focuses last item on End', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{End}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Orange');
			expectNoFalseFocusAttributes(listbox.element() ?? document);
		});

		it('never serializes false focus attributes during keyboard focus flow', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');
			expectNoFalseFocusAttributes(listbox.element() ?? document);

			await userEvent.keyboard('{ArrowDown}');
			expectNoFalseFocusAttributes(listbox.element() ?? document);
		});
	});

	describe('Selection', () => {
		it('selects item on Enter', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}'); // Ensure at first item
			await userEvent.keyboard('{Enter}');

			const selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption?.textContent).toContain('Apple');
		});

		it('selects item on Space', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');
			await userEvent.keyboard('{ArrowDown}');
			await userEvent.keyboard(' ');

			const selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption?.textContent).toContain('Banana');
		});

		it('toggles selection in toggle mode', async () => {
			const screen = render(ListBoxTest, { selectionBehavior: 'toggle' });
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}');

			// Select Apple
			await userEvent.keyboard('{Enter}');
			let selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption?.textContent).toContain('Apple');

			// Deselect Apple
			await userEvent.keyboard('{Enter}');
			selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption).toBeNull();
		});

		it('supports multiple selection', async () => {
			const screen = render(ListBoxTest, { selectionMode: 'multiple' });
			const listbox = screen.getByRole('listbox');

			// Click to select items directly
			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[0] as HTMLElement).click(); // Select Apple
			await (options[1] as HTMLElement).click(); // Select Banana

			const selectedOptions = listbox.element().querySelectorAll('[data-selected]');
			expect(selectedOptions.length).toBe(2);
			expect(selectedOptions[0].textContent).toContain('Apple');
			expect(selectedOptions[1].textContent).toContain('Banana');
		});

		it('selects item on click', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[2] as HTMLElement).click(); // Click Cherry

			const selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption?.textContent).toContain('Cherry');
		});

		it('continues keyboard navigation from the clicked item', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await userEvent.click(options[2] as HTMLElement);
			await expect.poll(() => document.activeElement === options[2]).toBe(true);
			await userEvent.keyboard('{ArrowDown}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Grape');
		});
	});

	describe('Value binding (uncontrolled + bound)', () => {
		it('updates bind:value when an item is selected on click', async () => {
			const screen = render(ListBoxBindValueTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[2] as HTMLElement).click(); // Cherry

			await expect
				.poll(() => screen.getByTestId('bound-value').element().textContent)
				.toBe('cherry');
		});

		it('updates bind:value when the selection is toggled off', async () => {
			const screen = render(ListBoxBindValueTest);
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[1] as HTMLElement).click(); // Select Banana
			await expect
				.poll(() => screen.getByTestId('bound-value').element().textContent)
				.toBe('banana');

			await (options[1] as HTMLElement).click(); // Deselect Banana
			await expect.poll(() => screen.getByTestId('bound-value').element().textContent).toBe('');
		});
	});

	describe('Controlled mode', () => {
		it('keeps the UI selection unchanged when the parent ignores onChange', async () => {
			const onChange = vi.fn();
			const screen = render(ListBoxControlledTest, { onChange });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[0].getAttribute('aria-selected')).toBe('true'); // Apple

			await (options[1] as HTMLElement).click(); // Click Banana

			// The change is emitted, but the parent did not apply it.
			expect(onChange).toHaveBeenCalledWith(new Set(['banana']));
			expect(options[1].getAttribute('aria-selected')).toBe('false');
			expect(options[0].getAttribute('aria-selected')).toBe('true');
		});

		it('applies the selection when the parent passes the new value back down', async () => {
			const screen = render(ListBoxControlledTest, { applyChanges: true });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[1] as HTMLElement).click(); // Click Banana

			await expect.poll(() => options[1].getAttribute('aria-selected')).toBe('true');
			expect(options[0].getAttribute('aria-selected')).toBe('false');
			await expect
				.poll(() => screen.getByTestId('controlled-value').element().textContent)
				.toBe('banana');
		});
	});

	describe('Loop', () => {
		it('does not wrap past the last item by default', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{End}'); // Orange (last)
			await userEvent.keyboard('{ArrowDown}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Orange');
		});

		it('wraps from the last item to the first when loop is true', async () => {
			const screen = render(ListBoxTest, { loop: true });
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{End}'); // Orange (last)
			await userEvent.keyboard('{ArrowDown}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Apple');
		});

		it('wraps from the first item to the last when loop is true', async () => {
			const screen = render(ListBoxTest, { loop: true });
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}'); // Apple (first)
			await userEvent.keyboard('{ArrowUp}');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Orange');
		});
	});

	describe('Typeahead', () => {
		it('focuses the option matching the typed characters when typeahead is true', async () => {
			const screen = render(ListBoxTest, { typeahead: true });
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}'); // Apple
			await userEvent.keyboard('g');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Grape');
		});

		it('ignores typed characters by default', async () => {
			const screen = render(ListBoxTest);
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}'); // Apple
			await userEvent.keyboard('g');

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Apple');
		});
	});

	describe('Reactive options', () => {
		it('applies selectionMode changes at runtime', async () => {
			const screen = render(ListBoxTest, { selectionMode: 'single' });
			const listbox = screen.getByRole('listbox');

			await screen.rerender({ selectionMode: 'multiple' });
			await expect.element(listbox).toHaveAttribute('aria-multiselectable', 'true');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[0] as HTMLElement).click();
			await (options[1] as HTMLElement).click();

			expect(listbox.element().querySelectorAll('[data-selected]').length).toBe(2);
		});
	});

	describe('Disabled Items', () => {
		it('skips disabled items during navigation', async () => {
			const screen = render(ListBoxTest, { disabledKeys: ['banana'] });
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}'); // Apple
			await userEvent.keyboard('{ArrowDown}'); // Should skip Banana, go to Cherry

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Cherry');
		});

		it('prevents selection of disabled items', async () => {
			const screen = render(ListBoxTest, { disabledKeys: ['banana'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[1] as HTMLElement).click(); // Click disabled Banana

			const selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption).toBeNull();
		});

		it('has aria-disabled on disabled items', async () => {
			const screen = render(ListBoxTest, { disabledKeys: ['banana'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[1].getAttribute('aria-disabled')).toBe('true');
		});

		it('updates aria-disabled when disabledKeys changes at runtime', async () => {
			const screen = render(ListBoxTest, { disabledKeys: [] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[1].getAttribute('aria-disabled')).toBeNull();

			await screen.rerender({ disabledKeys: ['banana'] });
			await expect.poll(() => options[1].getAttribute('aria-disabled')).toBe('true');

			await screen.rerender({ disabledKeys: [] });
			await expect.poll(() => options[1].getAttribute('aria-disabled')).toBeNull();
		});
	});
});
