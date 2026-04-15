import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxTest from '../root/combobox-test.svelte';
import ComboBoxScrollableListTest from './combobox-scrollable-list-test.svelte';

function mockScrollMetrics(
	element: HTMLElement,
	{
		scrollTop,
		scrollHeight,
		clientHeight
	}: { scrollTop: number; scrollHeight: number; clientHeight: number }
) {
	let currentScrollTop = scrollTop;

	Object.defineProperty(element, 'scrollTop', {
		configurable: true,
		get: () => currentScrollTop,
		set: (value: number) => {
			currentScrollTop = value;
		}
	});

	Object.defineProperty(element, 'scrollHeight', {
		configurable: true,
		get: () => scrollHeight
	});

	Object.defineProperty(element, 'clientHeight', {
		configurable: true,
		get: () => clientHeight
	});
}

describe('ComboBox.Popover', () => {
	describe('Visibility', () => {
		it('is hidden when closed', async () => {
			const screen = render(ComboBoxTest);

			// Should not have listbox visible initially
			const listbox = screen.container.querySelector('[role="listbox"]');
			expect(listbox).toBeNull();
		});

		it('is visible when open', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toBeVisible();
		});

		it('hides when pressing Escape', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			await expect.element(listbox).toBeVisible();

			// Close
			await userEvent.keyboard('{Escape}');

			// Listbox should be gone
			const listboxAfter = screen.container.querySelector('[role="listbox"]');
			expect(listboxAfter).toBeNull();
		});
	});

	describe('Positioning', () => {
		it('renders below the input by default', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');
			const inputRect = input.element().getBoundingClientRect();
			const listboxRect = listbox.element().getBoundingClientRect();

			// Listbox should be below the input
			expect(listboxRect.top).toBeGreaterThanOrEqual(inputRect.bottom);
		});
	});

	describe('Scroll handling', () => {
		it('contains scroll events within the popover', async () => {
			const screen = render(ComboBoxTest);
			const input = screen.getByRole('combobox');

			// Open the popover
			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox');

			// This is a behavioral test - the popover should handle wheel events
			// We're mainly testing that it doesn't throw errors
			await expect.element(listbox).toBeVisible();
		});

		it('stays open when the input blurs after mousedown inside the popover', async () => {
			const screen = render(ComboBoxScrollableListTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element() as HTMLElement;

			listbox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
			input.element()?.dispatchEvent(new FocusEvent('blur', { bubbles: false, cancelable: false }));

			await expect.element(input).toHaveAttribute('aria-expanded', 'true');
			await expect.element(screen.getByRole('listbox')).toBeVisible();
		});

		it('constrains the listbox height to the available viewport height', async () => {
			const screen = render(ComboBoxScrollableListTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element() as HTMLElement;

			await expect
				.poll(() => listbox.style.maxHeight, { timeout: 2000 })
				.toBe('var(--available-height)');
		});

		it('allows wheel events when the listbox owns the scrollable area', async () => {
			const screen = render(ComboBoxScrollableListTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element() as HTMLElement;
			const popover = listbox.parentElement as HTMLElement;

			listbox.style.overflowY = 'auto';
			mockScrollMetrics(listbox, { scrollTop: 24, scrollHeight: 240, clientHeight: 120 });
			mockScrollMetrics(popover, { scrollTop: 0, scrollHeight: 120, clientHeight: 120 });

			let bubbledToBody = false;
			const handleBodyWheel = () => {
				bubbledToBody = true;
			};
			document.body.addEventListener('wheel', handleBodyWheel, { once: true });

			const event = new WheelEvent('wheel', {
				deltaY: 40,
				bubbles: true,
				cancelable: true
			});

			listbox.dispatchEvent(event);

			expect(event.defaultPrevented).toBe(false);
			expect(bubbledToBody).toBe(false);
		});

		it('prevents wheel events when no internal scroll container can continue scrolling', async () => {
			const screen = render(ComboBoxScrollableListTest);
			const input = screen.getByRole('combobox');

			await input.click();
			await userEvent.keyboard('{ArrowDown}');

			const listbox = screen.getByRole('listbox').element() as HTMLElement;
			const popover = listbox.parentElement as HTMLElement;

			listbox.style.overflowY = 'auto';
			mockScrollMetrics(listbox, { scrollTop: 120, scrollHeight: 240, clientHeight: 120 });
			mockScrollMetrics(popover, { scrollTop: 0, scrollHeight: 120, clientHeight: 120 });

			let bubbledToBody = false;
			const handleBodyWheel = () => {
				bubbledToBody = true;
			};
			document.body.addEventListener('wheel', handleBodyWheel, { once: true });

			const event = new WheelEvent('wheel', {
				deltaY: 40,
				bubbles: true,
				cancelable: true
			});

			listbox.dispatchEvent(event);

			expect(event.defaultPrevented).toBe(true);
			expect(bubbledToBody).toBe(false);
		});
	});
});
