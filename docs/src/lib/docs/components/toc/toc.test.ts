import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Toc from './toc.svelte';

const HEADINGS = [
	{ id: 'anatomy', text: 'Anatomy', depth: 2 },
	{ id: 'api-root', text: 'Root', depth: 3 }
];

function tocLinks(): HTMLAnchorElement[] {
	return [...document.querySelectorAll('nav[aria-label="On this page"] a')] as HTMLAnchorElement[];
}

describe('Toc', () => {
	it('renders a "(Top)" entry followed by the provided headings', () => {
		render(Toc, { props: { headings: HEADINGS } });
		const items = tocLinks().map((a) => a.textContent?.trim());
		expect(items).toEqual(['(Top)', 'Anatomy', 'Root']);
		// "(Top)" targets the top-of-document fragment.
		expect(tocLinks()[0].getAttribute('href')).toBe('#top');
		// Headings link to their id fragments.
		expect(tocLinks()[1].getAttribute('href')).toBe('#anatomy');
	});

	it('marks "(Top)" active while scrolled at the top (no heading active)', () => {
		render(Toc, { props: { headings: HEADINGS } });
		// With nothing scrolled past, the active item is "(Top)".
		expect(tocLinks()[0].className).toContain('font-medium');
	});

	it('renders nothing when there are no headings', () => {
		render(Toc, { props: { headings: [] } });
		expect(document.querySelector('nav[aria-label="On this page"]')).toBeNull();
	});
});
