import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import SplitterTest from './splitter-test.svelte';

function splitter() {
	return document.querySelector<HTMLDivElement>('[data-testid="splitter"]')!;
}

function value() {
	return document.querySelector('[data-testid="value"]')?.textContent;
}

function pointer(target: Element, type: string, x: number, y: number) {
	target.dispatchEvent(
		new PointerEvent(type, {
			pointerType: 'mouse',
			pointerId: 1,
			isPrimary: true,
			button: 0,
			buttons: 1,
			clientX: x,
			clientY: y,
			bubbles: true,
			cancelable: true
		})
	);
}

describe('Separator as a window splitter', () => {
	it('is a focusable separator with a value, a range and a name', () => {
		render(SplitterTest);
		const element = splitter();

		expect(element.getAttribute('role')).toBe('separator');
		expect(element.getAttribute('aria-orientation')).toBe('vertical');
		expect(element.getAttribute('tabindex')).toBe('0');
		expect(element.getAttribute('aria-valuenow')).toBe('40');
		expect(element.getAttribute('aria-valuemin')).toBe('0');
		expect(element.getAttribute('aria-valuemax')).toBe('100');
		expect(element.getAttribute('aria-label')).toBe('Resize the pane');
		expect(element.getAttribute('aria-controls')).toBe('pane');
		expect(element.getAttribute('data-movable')).toBe('true');
		expect(element.style.touchAction).toBe('none');
	});

	it('moves with the arrow keys of its axis, by step and by largeStep with Shift', async () => {
		const onValueChange = vi.fn();
		render(SplitterTest, { onValueChange });
		splitter().focus();

		await userEvent.keyboard('{ArrowRight}');
		expect(value()).toBe('41');
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(value()).toBe('39');
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
		expect(value()).toBe('49');
		// The other axis does nothing to a vertical line.
		await userEvent.keyboard('{ArrowUp}{ArrowDown}');
		expect(value()).toBe('49');
		expect(onValueChange).toHaveBeenLastCalledWith(49);
		expect(splitter().getAttribute('aria-valuenow')).toBe('49');
		expect(splitter().getAttribute('data-focus-visible')).toBe('true');
	});

	it('uses the vertical arrows for a horizontal line', async () => {
		render(SplitterTest, { orientation: 'horizontal' });
		splitter().focus();

		await userEvent.keyboard('{ArrowDown}');
		expect(value()).toBe('41');
		await userEvent.keyboard('{ArrowRight}');
		expect(value()).toBe('41');
	});

	it('goes to the ends with Home and End, and folds and unfolds with Enter', async () => {
		render(SplitterTest);
		splitter().focus();

		await userEvent.keyboard('{End}');
		expect(value()).toBe('100');
		await userEvent.keyboard('{Home}');
		expect(value()).toBe('0');
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
		expect(value()).toBe('3');
		await userEvent.keyboard('{Enter}');
		expect(value()).toBe('0');
		await userEvent.keyboard('{Enter}');
		expect(value()).toBe('3');
	});

	it('stays in the range', async () => {
		render(SplitterTest, { min: 20, max: 60 });
		splitter().focus();

		await userEvent.keyboard('{End}{ArrowRight}');
		expect(value()).toBe('60');
		await userEvent.keyboard('{Home}{ArrowLeft}');
		expect(value()).toBe('20');
	});

	it('flips the horizontal arrows on a right-to-left page', async () => {
		render(SplitterTest, { dir: 'rtl' });
		splitter().focus();

		await userEvent.keyboard('{ArrowLeft}');
		expect(value()).toBe('41');
		await userEvent.keyboard('{ArrowRight}');
		expect(value()).toBe('40');
	});

	it('follows a drag along its parent', async () => {
		render(SplitterTest);
		const element = splitter();
		const rect = element.getBoundingClientRect();
		const x = rect.left + 4;
		const y = rect.top + 100;

		pointer(element, 'pointerdown', x, y);
		await tick();
		expect(element.getAttribute('data-dragging')).toBe('true');
		expect(document.activeElement).toBe(element);
		// The parent is 400 px wide: 80 px is a fifth of the range.
		pointer(element, 'pointermove', x + 80, y);
		await tick();
		expect(value()).toBe('60');
		pointer(element, 'pointermove', x - 400, y);
		await tick();
		expect(value()).toBe('0');
		pointer(element, 'pointerup', x - 400, y);
		await tick();
		expect(element.hasAttribute('data-dragging')).toBe(false);
		expect(element.hasAttribute('data-focus-visible')).toBe(false);
	});

	it('holds still when disabled, and says so', async () => {
		render(SplitterTest, { disabled: true });
		const element = splitter();
		expect(element.getAttribute('aria-disabled')).toBe('true');
		expect(element.getAttribute('tabindex')).toBe('0');

		element.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(value()).toBe('40');
		const rect = element.getBoundingClientRect();
		pointer(element, 'pointerdown', rect.left + 4, rect.top + 100);
		pointer(element, 'pointermove', rect.left + 84, rect.top + 100);
		await tick();
		expect(value()).toBe('40');
	});

	it('is a tab stop after the button before it', async () => {
		render(SplitterTest);
		document.querySelector<HTMLElement>('[data-testid="before"]')?.focus();
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(splitter());
	});
});
