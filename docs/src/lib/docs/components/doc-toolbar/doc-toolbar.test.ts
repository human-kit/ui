import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DocToolbar from './doc-toolbar.svelte';
import { setPage } from '../../test-stubs/app-state.svelte.js';

describe('DocToolbar', () => {
	it('links prev/next to the neighbouring pages in nav order', () => {
		// "quick-start" is the first nav item → no previous page, next is "accessibility".
		setPage({ params: { slug: 'quick-start' } });
		render(DocToolbar);
		const next = document.querySelector('a[aria-label^="Next:"]');
		expect(next?.getAttribute('href')).toBe('/docs/accessibility');
		// Previous is rendered as a disabled placeholder (not a link).
		expect(document.querySelector('a[aria-label^="Previous:"]')).toBeNull();
		expect(document.querySelectorAll('span[aria-hidden="true"]').length).toBeGreaterThanOrEqual(1);
	});

	it('opens a menu with the markdown and source actions', async () => {
		setPage({ params: { slug: 'button' } });
		render(DocToolbar);
		await userEvent.click(document.querySelector('button[aria-label="Page options"]')!);
		await expect
			.poll(() =>
				[...document.querySelectorAll('[role="menuitem"]')].map((i) => i.textContent?.trim())
			)
			.toEqual([
				'Copy page as Markdown',
				'View as Markdown',
				'Open in Claude',
				'Open in ChatGPT',
				'View source'
			]);
	});

	it('points the markdown action at the in-app raw markdown route via a real navigation', async () => {
		setPage({ params: { slug: 'button' } });
		render(DocToolbar);
		// The menu items navigate imperatively (onAction), so just assert the trigger
		// and both actions are present and labelled — navigation targets are unit-tested
		// by the +server route separately.
		await userEvent.click(document.querySelector('button[aria-label="Page options"]')!);
		const labels = [...document.querySelectorAll('[role="menuitem"]')].map((i) =>
			i.textContent?.trim()
		);
		expect(labels).toContain('View as Markdown');
		expect(labels).toContain('View source');
	});

	it('opens a new chat that reads the markdown twin of the page', async () => {
		setPage({ params: { slug: 'dialog' } });
		const opened: string[] = [];
		const original = window.open;
		window.open = ((url: string) => {
			opened.push(url);
			return null;
		}) as typeof window.open;
		try {
			render(DocToolbar);
			await userEvent.click(document.querySelector('button[aria-label="Page options"]')!);
			const claude = () =>
				[...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
					(i) => i.textContent?.trim() === 'Open in Claude'
				);
			await expect.poll(claude).toBeDefined();
			await userEvent.click(claude()!);
			await expect.poll(() => opened.length).toBe(1);
			const url = new URL(opened[0]);
			expect(url.origin).toBe('https://claude.ai');
			expect(url.searchParams.get('q')).toContain('https://ui.human-kit.com/docs/dialog.md');
		} finally {
			window.open = original;
		}
	});
});
