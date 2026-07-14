import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import LabelTest from './label-test.svelte';

function labelElement() {
	return document.querySelector<HTMLLabelElement>('[data-label-root="true"]')!;
}

describe('Label', () => {
	it('renders a label with the library root marker and forwards attributes', () => {
		render(LabelTest);
		const label = labelElement();

		expect(label).not.toBeNull();
		expect(label.tagName).toBe('LABEL');
		expect(label.getAttribute('for')).toBe('name-input');
		expect(label.textContent).toBe('Name');
	});

	it('exposes a bindable element reference and clears it on unmount', async () => {
		const screen = render(LabelTest);

		await expect
			.poll(() => document.querySelector('[data-testid="element-tag"]')?.textContent)
			.toBe('LABEL');

		await userEvent.click(screen.getByRole('button', { name: 'Unmount label' }));

		await expect
			.poll(() => document.querySelector('[data-testid="element-tag"]')?.textContent)
			.toBe('none');
	});

	it('prevents text selection on double click but not on single click', () => {
		const onMouseDown = vi.fn();
		render(LabelTest, { onMouseDown });
		const label = labelElement();

		const single = new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 1 });
		label.dispatchEvent(single);
		expect(single.defaultPrevented).toBe(false);

		// `detail > 1` marks the second click of a double click: selecting the
		// label text there would fight the control activation.
		const double = new MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 2 });
		label.dispatchEvent(double);
		expect(double.defaultPrevented).toBe(true);

		// The external handler stays composed and receives both events.
		expect(onMouseDown).toHaveBeenCalledTimes(2);
	});
});
