import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import SeparatorTest from './separator-test.svelte';

function separator() {
	return document.querySelector<HTMLDivElement>('[data-separator-root="true"]')!;
}

describe('Separator', () => {
	it('is a horizontal separator by default, with no aria-orientation', () => {
		render(SeparatorTest);
		const element = separator();

		expect(element.getAttribute('role')).toBe('separator');
		expect(element.hasAttribute('aria-orientation')).toBe(false);
		expect(element.getAttribute('data-orientation')).toBe('horizontal');
		expect(element.hasAttribute('data-decorative')).toBe(false);
		expect(element.className).toBe('line');
		expect(element.getAttribute('data-testid')).toBe('separator');
	});

	it('says it is vertical', () => {
		render(SeparatorTest, { orientation: 'vertical' });
		const element = separator();

		expect(element.getAttribute('role')).toBe('separator');
		expect(element.getAttribute('aria-orientation')).toBe('vertical');
		expect(element.getAttribute('data-orientation')).toBe('vertical');
	});

	it('is out of the accessibility tree when decorative', () => {
		render(SeparatorTest, { orientation: 'vertical', decorative: true });
		const element = separator();

		expect(element.getAttribute('role')).toBe('none');
		expect(element.hasAttribute('aria-orientation')).toBe(false);
		expect(element.getAttribute('data-decorative')).toBe('true');
		expect(element.getAttribute('data-orientation')).toBe('vertical');
	});

	it('is not a tab stop', async () => {
		render(SeparatorTest);
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement?.tagName).toBe('BUTTON');
	});

	it('gives its element to bind:element, and takes it back on unmount', async () => {
		const screen = render(SeparatorTest);
		await expect
			.poll(() => document.querySelector('[data-testid="element-tag"]')?.textContent)
			.toBe('DIV');

		await userEvent.click(screen.getByRole('button', { name: 'Unmount' }));
		await expect
			.poll(() => document.querySelector('[data-testid="element-tag"]')?.textContent)
			.toBe('none');
	});
});
