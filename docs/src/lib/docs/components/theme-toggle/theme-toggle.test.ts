import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import ThemeToggle from './theme-toggle.svelte';

describe('ThemeToggle', () => {
	it('renders an accessible toggle button', () => {
		render(ThemeToggle);
		const button = document.querySelector('button[aria-label="Toggle color theme"]');
		expect(button).toBeTruthy();
	});

	it('toggles the `dark` class on the document element when clicked', async () => {
		render(ThemeToggle);
		const button = document.querySelector<HTMLElement>('button[aria-label="Toggle color theme"]')!;
		const before = document.documentElement.classList.contains('dark');

		await userEvent.click(button);
		expect(document.documentElement.classList.contains('dark')).toBe(!before);

		await userEvent.click(button);
		expect(document.documentElement.classList.contains('dark')).toBe(before);
	});
});
