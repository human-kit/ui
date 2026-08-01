import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ComboBoxVirtualizedTest from './combobox-virtualized-test.svelte';

/** Options currently in the DOM — the point of virtualizing is that this is not all of them. */
function renderedOptionElements() {
	return Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
}

function renderedOptions() {
	return renderedOptionElements();
}

/** Options whose box actually overlaps the listbox's — what the user can see. */
function visibleOptionCount() {
	const listbox = document.querySelector('[role="listbox"]');
	if (!listbox) return 0;

	const bounds = listbox.getBoundingClientRect();

	return renderedOptionElements().filter((option) => {
		const rect = option.getBoundingClientRect();
		return rect.bottom > bounds.top && rect.top < bounds.bottom;
	}).length;
}

async function open() {
	const screen = render(ComboBoxVirtualizedTest);
	const input = screen.getByRole('combobox');

	await input.click();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(screen.getByRole('listbox')).toBeInTheDocument();

	return { screen, input };
}

describe('ComboBox.List (virtualized)', () => {
	it('renders a window of rows instead of the whole list', async () => {
		await open();

		const options = renderedOptions();

		expect(options.length).toBeGreaterThan(0);
		// A 200px viewport of 32px rows plus a small overscan — nowhere near 500.
		expect(options.length).toBeLessThan(30);
	});

	it('sizes the scroll area to the whole list', async () => {
		await open();

		const spacer = document.querySelector<HTMLElement>('[data-listbox-spacer]');

		// 500 rows of 30px with a 2px gap and none trailing the last one.
		expect(spacer?.getBoundingClientRect().height).toBeCloseTo(500 * 32 - 2, 0);
	});

	it('renders the rows the scroll position reveals', async () => {
		await open();

		const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
		expect(listbox).not.toBeNull();

		listbox!.scrollTop = 3200; // 100 rows down
		listbox!.dispatchEvent(new Event('scroll'));

		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toContain('Opción 0100');

		expect(renderedOptions().map((option) => option.textContent?.trim())).not.toContain(
			'Opción 0000'
		);
	});

	// Navigation walks the item array, not the mounted rows: with only a window in the DOM,
	// End used to land on the last *rendered* option.
	it('reaches the end of the list with End', async () => {
		const { input } = await open();

		await userEvent.keyboard('{End}');

		await expect.poll(() => input.element().getAttribute('aria-activedescendant')).toMatch(/-499$/);

		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toContain('Opción 0499');
	});

	it('keeps stepping past the edge of the rendered window', async () => {
		const { input } = await open();

		for (let index = 0; index < 25; index += 1) {
			await userEvent.keyboard('{ArrowDown}');
		}

		await expect
			.poll(() => input.element().getAttribute('aria-activedescendant'))
			.toMatch(/-2[0-9]$/);
	});

	it('filters over the whole list, not just the rendered rows', async () => {
		const { input } = await open();

		await userEvent.fill(input.element() as HTMLInputElement, 'Opción 0400');

		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toEqual(['Opción 0400']);
	});

	// The options are "Opción NNNN"; typing without the accent has to find them.
	it('filters without the accents', async () => {
		const { input } = await open();

		await userEvent.fill(input.element() as HTMLInputElement, 'opcion 0400');

		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toEqual(['Opción 0400']);
	});

	// The blank list: rendering the right *rows* is not enough if they are placed somewhere
	// the viewport isn't looking. The offset used to drift by about a pixel per row —
	// invisible at the top of the list, a screenful of nothing a thousand rows down.
	it('places the rendered rows where the viewport is looking, deep into the list', async () => {
		await open();

		const listbox = document.querySelector<HTMLElement>('[role="listbox"]')!;

		for (const scrollTop of [3200, 8000, 15000]) {
			listbox.scrollTop = scrollTop;
			listbox.dispatchEvent(new Event('scroll'));

			await expect.poll(() => visibleOptionCount()).toBeGreaterThan(0);
		}
	});

	// Reopening with a selection scrolls to it; before the scroll was clamped and read back,
	// the state kept an out-of-range offset and the list came back empty.
	it('comes back with rows after selecting and reopening', async () => {
		const { input } = await open();

		await userEvent.fill(input.element() as HTMLInputElement, 'Opción 0400');
		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toEqual(['Opción 0400']);
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await expect.element(input).toHaveValue('Opción 0400');

		await userEvent.keyboard('{Escape}');
		await input.click();
		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => visibleOptionCount()).toBeGreaterThan(0);
	});

	// The cost of opening has to be the same whether the list holds twenty rows or a
	// thousand. It wasn't: a popover applies its max height *after* it opens, so the first
	// measurement saw a scroller as tall as its content, asked for a window of every row,
	// and mounted the whole list before shrinking back — seven seconds for 1122 options.
	it('never mounts more than a screenful, even before the scroller is constrained', async () => {
		const screen = render(ComboBoxVirtualizedTest, { count: 1122, constrainLate: true });
		const input = screen.getByRole('combobox');

		await input.click();
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(screen.getByRole('listbox')).toBeInTheDocument();

		// Sampled while the constraint is still pending: a screen's worth of rows at most,
		// never the whole list.
		expect(renderedOptions().length).toBeLessThan(120);

		await expect.poll(() => renderedOptions().length).toBeLessThan(40);
	});

	// Reopening used to put the selection flush against the bottom edge — and, because the
	// maths ignored the scroller's padding, a few pixels past it: the row the list opened on
	// was the one row you couldn't read.
	it('reopens with the selection whole and away from the edges', async () => {
		const { input } = await open();

		await userEvent.fill(input.element() as HTMLInputElement, 'Opción 0400');
		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toEqual(['Opción 0400']);
		await userEvent.keyboard('{ArrowDown}{Enter}');
		await expect.element(input).toHaveValue('Opción 0400');

		await userEvent.keyboard('{Escape}');
		await input.click();
		await userEvent.keyboard('{ArrowDown}');

		const selected = () =>
			renderedOptions().find((option) => option.textContent?.trim() === 'Opción 0400');

		await expect.poll(() => Boolean(selected())).toBe(true);

		const listbox = document.querySelector<HTMLElement>('[role="listbox"]')!;
		const bounds = listbox.getBoundingClientRect();
		const rect = selected()!.getBoundingClientRect();

		// Whole, not clipped by either edge…
		expect(rect.top).toBeGreaterThanOrEqual(bounds.top - 0.5);
		expect(rect.bottom).toBeLessThanOrEqual(bounds.bottom + 0.5);
		// …and with rows visible above and below it, so it reads as "here it is", not as the
		// end of the list.
		expect(rect.top - bounds.top).toBeGreaterThan(rect.height);
		expect(bounds.bottom - rect.bottom).toBeGreaterThan(rect.height);
	});

	it('selects a row that was scrolled to', async () => {
		const { input } = await open();

		await userEvent.keyboard('{End}');
		await expect
			.poll(() => renderedOptions().map((option) => option.textContent?.trim()))
			.toContain('Opción 0499');
		await userEvent.keyboard('{Enter}');

		await expect.element(input).toHaveValue('Opción 0499');
	});
});
