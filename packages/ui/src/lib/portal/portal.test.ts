import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PortalTest from './portal-test.svelte';

function contentParentTestId(): string | null {
	const content = document.querySelector('[data-testid="portal-content"]');
	const parent = content?.parentElement?.parentElement ?? null; // skip the display:contents wrapper
	if (!parent) return null;
	// The test runner renders straight into document.body (and stamps its own
	// data-testid on it), so identify the body by node, not by attribute.
	if (parent === document.body) return 'BODY';
	return parent.getAttribute('data-testid') ?? parent.tagName;
}

describe('Portal', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders into document.body by default', async () => {
		render(PortalTest);

		await expect.poll(() => contentParentTestId()).toBe('BODY');
	});

	it('renders into a selector target', async () => {
		render(PortalTest, { initialTarget: '#portal-target-a' });

		await expect.poll(() => contentParentTestId()).toBe('target-a');
	});

	it('accepts an HTMLElement target', async () => {
		render(PortalTest, { initialTarget: '#portal-target-a' });
		await expect.poll(() => contentParentTestId()).toBe('target-a');

		document.querySelector<HTMLElement>('[data-testid="to-element"]')?.click();

		await expect.poll(() => contentParentTestId()).toBe('element-target');
	});

	it('re-portals the content when target changes after mount', async () => {
		render(PortalTest, { initialTarget: '#portal-target-a' });
		await expect.poll(() => contentParentTestId()).toBe('target-a');

		document.querySelector<HTMLElement>('[data-testid="to-b"]')?.click();
		await expect.poll(() => contentParentTestId()).toBe('target-b');

		// The old target must be empty again.
		expect(
			document.querySelector('[data-testid="target-a"] [data-testid="portal-content"]')
		).toBeNull();

		document.querySelector<HTMLElement>('[data-testid="to-a"]')?.click();
		await expect.poll(() => contentParentTestId()).toBe('target-a');
	});

	it('logs an error and keeps content in place when the target does not resolve', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		render(PortalTest, { initialTarget: '#portal-target-a' });
		await expect.poll(() => contentParentTestId()).toBe('target-a');

		document.querySelector<HTMLElement>('[data-testid="to-missing"]')?.click();

		await expect
			.poll(() =>
				consoleError.mock.calls.some((call) =>
					String(call[0]).includes('Portal: target "#does-not-exist" not found')
				)
			)
			.toBe(true);
		// The content stays where it was (the previous target).
		expect(contentParentTestId()).toBe('target-a');
	});
});
