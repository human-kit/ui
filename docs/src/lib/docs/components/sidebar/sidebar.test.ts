import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Sidebar from './sidebar.svelte';
import { setPage } from '../../test-stubs/app-state.svelte.js';
import type { NavGroup } from '../../nav.js';

const NAV: NavGroup[] = [
	{ label: 'Form', items: [{ slug: 'button', title: 'Button' }, { slug: 'input', title: 'Input' }] },
	{ label: 'Overlays', items: [{ slug: 'dialog', title: 'Dialog' }] }
];

function links(): HTMLAnchorElement[] {
	return [...document.querySelectorAll('nav a')] as HTMLAnchorElement[];
}

describe('Sidebar', () => {
	it('renders every group label and item link', () => {
		setPage({ pathname: '/docs/button' });
		render(Sidebar, { props: { nav: NAV } });
		const text = document.body.textContent ?? '';
		expect(text).toContain('Form');
		expect(text).toContain('Overlays');
		const titles = links().map((a) => a.textContent?.trim());
		expect(titles).toEqual(['Button', 'Input', 'Dialog']);
	});

	it('marks the item matching the current route as the active page', () => {
		setPage({ pathname: '/docs/dialog' });
		render(Sidebar, { props: { nav: NAV } });
		const active = links().filter((a) => a.getAttribute('aria-current') === 'page');
		expect(active).toHaveLength(1);
		expect(active[0].textContent?.trim()).toBe('Dialog');
	});
});
