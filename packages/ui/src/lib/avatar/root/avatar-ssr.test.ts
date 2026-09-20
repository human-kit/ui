// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import AvatarTest from './avatar-test.svelte';

describe('Avatar SSR', () => {
	it('renders the fallback and no image before hydration', () => {
		const { body } = render(AvatarTest, { props: { src: '/ada.jpg' } });
		expect(body).toContain('data-status="loading"');
		expect(body).toContain('data-avatar-fallback="true"');
		expect(body).not.toContain('<img');
	});

	it('holds a delayed fallback back on the server too', () => {
		const { body } = render(AvatarTest, { props: { src: '/ada.jpg', delay: 600 } });
		expect(body).not.toContain('data-avatar-fallback');
		expect(body).not.toContain('<img');
	});
});
