import { describe, expect, it } from 'vitest';
import { componentTitle, guideTitle, isComponentSlug, landingTitle } from './seo.js';
import { absolute, SITE_URL } from './site.js';

// Route sources as text. Vite inlines them at transform time, so this runs in
// the browser instance like every other test here.
const routeSources = import.meta.glob('/src/routes/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

describe('head ownership', () => {
	/**
	 * Svelte dedupes `<title>` across components but NOT `<meta>`. When both the
	 * root layout and a page declared a description, every docs page shipped two
	 * conflicting ones and search engines picked whichever they liked — so the
	 * head lives in exactly one place and this keeps it there.
	 */
	it('only the root layout renders a head block', () => {
		const offenders = Object.entries(routeSources)
			.filter(([path]) => path !== '/src/routes/+layout.svelte')
			.filter(([, source]) => source.includes('<svelte:head'))
			.map(([path]) => path);

		expect(offenders).toEqual([]);
	});
});

describe('titles', () => {
	it('puts the words a reader searches for in a component title', () => {
		const title = componentTitle('Drawer');
		expect(title).toContain('Drawer');
		expect(title).toContain('Svelte');
		expect(title).toContain('component');
	});

	it('leads a guide title with the page name', () => {
		expect(guideTitle('Quick Start').startsWith('Quick Start')).toBe(true);
	});

	// Google truncates the displayed title around 60 characters; the longest
	// component name is the one that decides whether the template still fits.
	it('keeps the longest component title under 60 characters', () => {
		expect(componentTitle('DateRangePicker').length).toBeLessThanOrEqual(60);
		expect(landingTitle.length).toBeLessThanOrEqual(60);
	});

	it('separates components from guides', () => {
		expect(isComponentSlug('drawer')).toBe(true);
		expect(isComponentSlug('quick-start')).toBe(false);
	});
});

describe('absolute()', () => {
	it('maps the root path to the bare origin', () => {
		expect(absolute('/')).toBe(SITE_URL);
	});

	it('never emits a trailing slash', () => {
		expect(absolute('/docs/drawer/')).toBe(`${SITE_URL}/docs/drawer`);
	});
});
