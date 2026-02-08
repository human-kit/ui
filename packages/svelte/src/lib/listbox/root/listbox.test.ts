import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ListBoxTest from './listbox-test.svelte';

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
	});

	describe('Disabled Items', () => {
		it('skips disabled items during navigation', async () => {
			const screen = render(ListBoxTest, { disabledIds: ['banana'] });
			const listbox = screen.getByRole('listbox');

			await listbox.click();
			await userEvent.keyboard('{Home}'); // Apple
			await userEvent.keyboard('{ArrowDown}'); // Should skip Banana, go to Cherry

			const focusedOption = listbox.element().querySelector('[data-focused]');
			expect(focusedOption?.textContent).toContain('Cherry');
		});

		it('prevents selection of disabled items', async () => {
			const screen = render(ListBoxTest, { disabledIds: ['banana'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			await (options[1] as HTMLElement).click(); // Click disabled Banana

			const selectedOption = listbox.element().querySelector('[data-selected]');
			expect(selectedOption).toBeNull();
		});

		it('has aria-disabled on disabled items', async () => {
			const screen = render(ListBoxTest, { disabledIds: ['banana'] });
			const listbox = screen.getByRole('listbox');

			const options = listbox.element().querySelectorAll('[role="option"]');
			expect(options[1].getAttribute('aria-disabled')).toBe('true');
		});
	});
});
