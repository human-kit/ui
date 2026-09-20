import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AvatarGroupTest from './avatar-group-test.svelte';

function avatars() {
	return Array.from(document.querySelectorAll<HTMLElement>('[data-testid="avatar"]'));
}

function count() {
	return document.querySelector<HTMLElement>('[data-testid="count"]');
}

describe('Avatar.Group', () => {
	it('is a named group that shows every avatar without a limit, and no count', () => {
		render(AvatarGroupTest);
		const group = document.querySelector('[data-testid="group"]');

		expect(group?.getAttribute('role')).toBe('group');
		expect(group?.getAttribute('aria-label')).toBe('Assignees');
		expect(group?.hasAttribute('data-overflow')).toBe(false);
		expect(avatars()).toHaveLength(5);
		expect(avatars().map((avatar) => avatar.getAttribute('data-index'))).toEqual([
			'0',
			'1',
			'2',
			'3',
			'4'
		]);
		expect(count()).toBeNull();
	});

	it('shows the first max avatars, and counts the rest for the screen reader', () => {
		render(AvatarGroupTest, { max: 3 });

		expect(avatars()).toHaveLength(3);
		expect(
			avatars().map((avatar) => avatar.querySelector('[data-avatar-fallback]')?.textContent?.trim())
		).toEqual(['A', 'G', 'K']);
		expect(document.querySelector('[data-testid="group"]')?.getAttribute('data-overflow')).toBe(
			'true'
		);
		expect(count()?.textContent?.trim()).toBe('+2');
		expect(count()?.getAttribute('role')).toBe('img');
		expect(count()?.getAttribute('aria-label')).toBe('2 more');
	});

	it('speaks the locale', () => {
		render(AvatarGroupTest, { max: 4, locale: 'es' });
		expect(count()?.getAttribute('aria-label')).toBe('1 más');
	});

	it('follows the list: an avatar that leaves lets the next one in', async () => {
		const screen = render(AvatarGroupTest, { max: 3 });
		expect(count()?.textContent?.trim()).toBe('+2');

		await screen.rerender({ max: 3, names: ['Grace', 'Katherine', 'Mary', 'Dorothy'] });
		expect(
			avatars().map((avatar) => avatar.querySelector('[data-avatar-fallback]')?.textContent?.trim())
		).toEqual(['G', 'K', 'M']);
		expect(count()?.textContent?.trim()).toBe('+1');

		await screen.rerender({ max: 3, names: ['Grace', 'Katherine'] });
		expect(avatars()).toHaveLength(2);
		expect(count()).toBeNull();
	});
});
