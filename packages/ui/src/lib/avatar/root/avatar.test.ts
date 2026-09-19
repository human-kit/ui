import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AvatarTest from './avatar-test.svelte';

// A 1 by 1 PNG. The browser loads it at once, from memory.
const PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const BROKEN = 'data:image/png;base64,not-an-image';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T | null {
	return document.querySelector<T>(`[data-testid="${id}"]`);
}

describe('Avatar', () => {
	it('shows the image once it loads, and no fallback after', async () => {
		const onStatusChange = vi.fn();
		render(AvatarTest, { src: PIXEL, onStatusChange });

		await expect.poll(() => byTestId('root')?.getAttribute('data-status')).toBe('loaded');
		const image = byTestId<HTMLImageElement>('image');
		expect(image?.tagName).toBe('IMG');
		expect(image?.getAttribute('src')).toBe(PIXEL);
		expect(image?.getAttribute('alt')).toBe('Ada Lovelace');
		expect(image?.getAttribute('data-avatar-image')).toBe('true');
		expect(byTestId('fallback')).toBeNull();
		expect(byTestId('image-tag')?.textContent).toBe('IMG');
		expect(byTestId('fallback-tag')?.textContent).toBe('none');
		expect(onStatusChange).toHaveBeenLastCalledWith('loaded');
	});

	it('shows the fallback, and no image, when the image fails', async () => {
		const onStatusChange = vi.fn();
		render(AvatarTest, { src: BROKEN, onStatusChange });

		await expect.poll(() => byTestId('root')?.getAttribute('data-status')).toBe('error');
		expect(byTestId('image')).toBeNull();
		expect(byTestId('fallback')?.textContent?.trim()).toBe('AL');
		expect(byTestId('fallback')?.getAttribute('data-status')).toBe('error');
		expect(onStatusChange).toHaveBeenLastCalledWith('error');
	});

	it('shows the fallback at once without a source', async () => {
		render(AvatarTest, { src: null });

		await expect.poll(() => byTestId('root')?.getAttribute('data-status')).toBe('error');
		expect(byTestId('image')).toBeNull();
		expect(byTestId('fallback')).not.toBeNull();
	});

	it('holds the fallback back for the delay while the image loads, and not on a failure', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		try {
			// A source that never answers: the load stays pending.
			render(AvatarTest, { src: 'http://127.0.0.1:9/never.png', delay: 500 });
			expect(byTestId('root')?.getAttribute('data-status')).toBe('loading');
			expect(byTestId('fallback')).toBeNull();

			await vi.advanceTimersByTimeAsync(400);
			expect(byTestId('fallback')).toBeNull();
			await vi.advanceTimersByTimeAsync(100);
			await expect.poll(() => byTestId('fallback')).not.toBeNull();
		} finally {
			vi.useRealTimers();
		}
	});

	it('shows the fallback at once on a failure, delay or not', async () => {
		render(AvatarTest, { src: BROKEN, delay: 10000 });
		await expect.poll(() => byTestId('root')?.getAttribute('data-status')).toBe('error');
		expect(byTestId('fallback')).not.toBeNull();
	});

	it('loads again when the source changes', async () => {
		const screen = render(AvatarTest, { src: BROKEN });
		await expect.poll(() => byTestId('root')?.getAttribute('data-status')).toBe('error');

		await screen.rerender({ src: PIXEL });
		await expect.poll(() => byTestId('root')?.getAttribute('data-status')).toBe('loaded');
		expect(byTestId('image')).not.toBeNull();
		expect(byTestId('fallback')).toBeNull();
	});

	it('is not in the tab order', () => {
		render(AvatarTest, { src: null });
		const root = byTestId('root');
		expect(root?.hasAttribute('tabindex')).toBe(false);
		expect(root?.hasAttribute('role')).toBe(false);
	});
});
