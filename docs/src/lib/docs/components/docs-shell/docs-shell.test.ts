import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';
import DocsShell from './docs-shell.svelte';
import { setPage } from '../../test-stubs/app-state.svelte.js';
import type { NavGroup } from '../../nav.js';

const NAV: NavGroup[] = [{ label: 'Form', items: [{ slug: 'button', title: 'Button' }] }];
const children = createRawSnippet(() => ({ render: () => `<p data-testid="content">Page body</p>` }));

describe('DocsShell', () => {
	it('renders the header, sidebar nav, and page content together', () => {
		setPage({ pathname: '/docs/button' });
		render(DocsShell, { props: { nav: NAV, title: 'svelte-components', badge: 'beta', children } });
		const text = document.body.textContent ?? '';
		// Header brand
		expect(text).toContain('svelte-components');
		// Sidebar nav item
		expect(document.querySelector('nav a')?.textContent?.trim()).toBe('Button');
		// Page content (the children snippet)
		expect(document.querySelector('[data-testid="content"]')?.textContent).toBe('Page body');
	});
});
