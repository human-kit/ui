import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DatePickerTest from './date-picker-test.svelte';
import DatePickerBindableTest from './date-picker-bindable-test.svelte';
import DatePickerBindableEmptyTest from './date-picker-bindable-empty-test.svelte';
import DatePickerOpenCancelTest from './date-picker-open-cancel-test.svelte';
import {
	expectFocusVisibleImpliesFocusWithin,
	expectNoFalseFocusAttributes
} from '../../test-utils/focus-contract';

function getSegment(type: 'day' | 'month' | 'year') {
	const element = document.querySelector<HTMLElement>(`[role="spinbutton"][data-type="${type}"]`);
	if (!element) {
		throw new Error(`Segment "${type}" was not rendered.`);
	}

	return {
		element: () => element,
		click: () => element.click()
	};
}

function getGridCellByDate(date: string) {
	const element = document.querySelector<HTMLElement>(`[role="gridcell"][data-date="${date}"]`);
	if (!element) {
		throw new Error(`Grid cell "${date}" was not rendered.`);
	}

	// The clickable handler lives on the inner `[role="button"]` div, not on the
	// `[role="gridcell"]` td. A .click() on the td would not reach that handler,
	// so delegate the click to the inner interactive element.
	const button = element.querySelector<HTMLElement>('[role="button"]') ?? element;

	return {
		element: () => element,
		click: () => button.click()
	};
}

describe('DatePicker.Root', () => {
	afterEach(() => {
		const dialogs = document.querySelectorAll('[role="dialog"]');
		dialogs.forEach((dialog) => dialog.remove());
	});

	it('exposes role="group" on the root only when it is labeled', async () => {
		render(DatePickerTest, { rootAriaLabel: 'Appointment date' });
		const labeledRoot = document.querySelector('[aria-label="Appointment date"]');
		expect(labeledRoot?.getAttribute('role')).toBe('group');
	});

	it('renders the root without a role when it has no label', async () => {
		render(DatePickerTest);
		const root = document.querySelector('.date-picker-input')?.parentElement;
		expect(root?.getAttribute('role')).toBeNull();
		expect(root?.getAttribute('aria-label')).toBeNull();
	});

	it('opens calendar when trigger is clicked', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-open-reason"]')?.textContent)
			.toBe('trigger-press');
	});

	it('keeps focus on segment and does not open popover on segment click', async () => {
		render(DatePickerTest);
		const monthSegment = getSegment('month');

		await monthSegment.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(monthSegment.element());
	});

	it('updates value when selecting a date from calendar', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		const dayCell = getGridCellByDate('2026-02-12');
		await dayCell.click();

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('2026-02-12');
	});

	it('closes popover after calendar selection when closeOnSelect is true', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		await expect
			.poll(() => document.querySelector('[role="gridcell"][data-date="2026-02-14"]'))
			.toBeTruthy();
		// The clickable handler is on the inner `[role="button"]` div, not the td.
		const dayCell = document.querySelector<HTMLElement>('[role="button"][data-date="2026-02-14"]');
		expect(dayCell).toBeTruthy();
		dayCell?.click();

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
		await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBeNull();
	});

	it('restores trigger as focus-visible when calendar selection is confirmed via keyboard', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		// The roving-focus tabindex lives on the inner `[role="button"]` day cell.
		const activeCell = document.querySelector<HTMLElement>('[role="button"][tabindex="0"]');
		expect(activeCell).toBeTruthy();
		activeCell?.focus();
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
		await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBe('true');
	});

	it('marks trigger focused without stealing focus back on outside pointer press', async () => {
		const screen = render(DatePickerTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });
		const outside = screen.getByTestId('outside-button');

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		outside.element()?.dispatchEvent(
			new MouseEvent('mousedown', {
				bubbles: true,
				cancelable: true
			})
		);

		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => trigger.element()?.getAttribute('data-focused')).toBe('true');
		await expect.poll(() => trigger.element()?.getAttribute('data-focus-visible')).toBeNull();
		// INVERTED (previously asserted focus returned to the trigger): an
		// outside press must not steal focus back — the pressed element keeps
		// its native focus/caret behavior (APG/React Aria/Radix).
		expect(document.activeElement).not.toBe(trigger.element());
	});

	it('clears active segment focused state when focus moves outside date picker', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = getSegment('month');
		const outsideButton = screen.getByTestId('outside-button');

		monthSegment.element()?.focus();
		await expect.poll(() => monthSegment.element()?.getAttribute('data-focused')).toBe('true');

		outsideButton.element()?.focus();
		await expect.poll(() => monthSegment.element()?.getAttribute('data-focused')).toBeNull();
	});

	it('does not open calendar or allow value changes in readOnly mode', async () => {
		render(DatePickerTest, { readonly: true });
		expect(document.querySelector('button[aria-haspopup="dialog"]')).toBeNull();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

		await expect
			.poll(() => document.querySelector('[data-testid="date-picker-value"]')?.textContent)
			.toBe('');
	});

	it('does not open calendar or edit segments when disabled', async () => {
		const screen = render(DatePickerTest, { disabled: true });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });
		const daySegment = getSegment('day');

		trigger.element()?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();

		daySegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(document.querySelector('[data-testid="date-picker-value"]')?.textContent).toBe('');
	});

	it('supports bind:open and bind:value updates', async () => {
		const screen = render(DatePickerBindableTest);
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		expect(document.querySelector('[data-testid="bind-open"]')?.textContent).toBe('false');
		expect(document.querySelector('[data-testid="bind-value"]')?.textContent).toBe('2026-02-10');

		await trigger.click();
		await expect
			.poll(() => document.querySelector('[data-testid="bind-open"]')?.textContent)
			.toBe('true');

		const dayCell = getGridCellByDate('2026-02-12');
		await dayCell.click();

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('2026-02-12');
	});

	it('clears bound value when editing makes the draft invalid', async () => {
		render(DatePickerBindableTest);
		const daySegment = getSegment('day');

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');
		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');
	});

	it('initializes bind:value as null without emitting onChange on mount', async () => {
		render(DatePickerBindableEmptyTest);
		await expect
			.poll(() => document.querySelector('[data-testid="bind-value-state"]')?.textContent)
			.toBe('null');
		expect(document.querySelector('[data-testid="on-change-calls"]')?.textContent).toBe('0');
	});

	it('keeps null state during invalid partial draft after null-first initialization', async () => {
		render(DatePickerBindableEmptyTest);
		const daySegment = getSegment('day');

		expect(document.querySelector('[data-testid="bind-value-state"]')?.textContent).toBe('null');
		daySegment.element()?.focus();
		await userEvent.keyboard('1');

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value-state"]')?.textContent)
			.toBe('null');
		expect(document.querySelector('[data-testid="on-change-calls"]')?.textContent).toBe('0');
	});

	it('does not auto-correct when typing a date out of range but sets invalid attributes', async () => {
		const screen = render(DatePickerTest, { defaultValue: '2026-02-14', maxValue: '2026-02-14' });
		const daySegment = getSegment('day');
		const inputGroup = screen.getByRole('group', { name: 'Date input' });
		// The draft-invalid state is exposed on the root via data-invalid. The
		// input group's aria-invalid/data-invalid are consumer-controlled props and
		// are not wired to the draft in this harness, so assert against the root.
		const inputId = inputGroup.element()?.getAttribute('id') ?? '';
		const rootId = inputId.endsWith('-input') ? inputId.slice(0, -'-input'.length) : '';
		const root = rootId ? document.getElementById(rootId) : null;

		expect(root?.getAttribute('data-invalid')).toBeNull();

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}{Backspace}15'); // 2026-02-15 is out of range

		await expect.poll(() => root?.getAttribute('data-invalid')).toBe('true');
		// No auto-correction: the out-of-range date is not silently committed.
		expect(document.querySelector('[data-testid="date-picker-value"]')?.textContent).not.toBe(
			'2026-02-15'
		);
	});

	it('toggles invalid draft attributes when draft becomes invalid and valid again', async () => {
		const screen = render(DatePickerBindableTest);
		const daySegment = getSegment('day');
		const inputGroup = screen.getByRole('group', { name: 'Date input' });
		const inputId = inputGroup.element()?.getAttribute('id') ?? '';
		const rootId = inputId.endsWith('-input') ? inputId.slice(0, -'-input'.length) : '';
		const root = rootId ? document.getElementById(rootId) : null;

		// The draft-invalid state is exposed on the root via data-invalid; the input
		// group's aria-invalid/data-invalid are consumer-controlled props not wired
		// to the draft in this harness, so the root is the source of truth here.
		expect(root?.getAttribute('data-invalid')).toBeNull();

		daySegment.element()?.focus();
		await userEvent.keyboard('{Backspace}');
		await userEvent.keyboard('{Backspace}');

		await expect.poll(() => root?.getAttribute('data-invalid')).toBe('true');
		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('');

		await userEvent.keyboard('1');
		await userEvent.keyboard('0');

		await expect
			.poll(() => document.querySelector('[data-testid="bind-value"]')?.textContent)
			.toBe('2026-02-10');
		await expect.poll(() => root?.getAttribute('data-invalid')).toBeNull();
	});

	it('respects onOpenChange cancellation when opening', async () => {
		const screen = render(DatePickerOpenCancelTest, { cancelOpen: true });
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		await trigger.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('respects onOpenChange cancellation when closing', async () => {
		render(DatePickerOpenCancelTest, { defaultOpen: true, cancelClose: true });
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();
	});

	it('keeps focus contract invariant for root attributes', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = getSegment('month');
		const inputGroup = screen.getByRole('group', { name: 'Date input' });
		const outsideButton = screen.getByTestId('outside-button');
		const inputId = inputGroup.element()?.getAttribute('id') ?? '';
		const rootId = inputId.endsWith('-input') ? inputId.slice(0, -'-input'.length) : '';
		const root = rootId ? document.getElementById(rootId) : null;

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		expectFocusVisibleImpliesFocusWithin(root);

		outsideButton.element()?.focus();
		await expect.poll(() => root?.getAttribute('data-focus-within')).toBeNull();
		await expect.poll(() => root?.getAttribute('data-focus-visible')).toBeNull();
		expectFocusVisibleImpliesFocusWithin(root);
	});

	it('never sets focus data attributes to false', async () => {
		const screen = render(DatePickerTest);
		const monthSegment = getSegment('month');
		const trigger = screen.getByRole('button', { name: 'Open calendar' });

		monthSegment.element()?.focus();
		await userEvent.keyboard('{ArrowUp}');
		await trigger.click();
		expectNoFalseFocusAttributes(document);
	});
});
