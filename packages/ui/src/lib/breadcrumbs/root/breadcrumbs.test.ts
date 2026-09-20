import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import BreadcrumbsTest from './breadcrumbs-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

describe('Breadcrumbs', () => {
	it('is a nav landmark named Breadcrumb, with an ordered list of items', () => {
		render(BreadcrumbsTest);
		const nav = byTestId('nav');

		expect(nav.tagName).toBe('NAV');
		expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
		expect(nav.className).toBe('trail');
		const list = byTestId('list');
		expect(list.tagName).toBe('OL');
		expect(list.getAttribute('role')).toBe('list');
		expect(list.parentElement).toBe(nav);
		const items = list.querySelectorAll(':scope > li');
		expect(items).toHaveLength(3);
		expect(byTestId('nav-tag').textContent).toBe('NAV');
	});

	it('takes the name from the locale, and from aria-label first', () => {
		render(BreadcrumbsTest, { locale: 'es-AR' });
		expect(byTestId('nav').getAttribute('aria-label')).toBe('Ruta de navegación');

		document.body.innerHTML = '';
		render(BreadcrumbsTest, { locale: 'es-AR', label: 'Ubicación' });
		expect(byTestId('nav').getAttribute('aria-label')).toBe('Ubicación');
	});

	it('marks the current page, and keeps it a link with an href', () => {
		render(BreadcrumbsTest);
		const current = byTestId('current');

		expect(current.tagName).toBe('A');
		expect(current.getAttribute('href')).toBe('/docs/breadcrumbs');
		expect(current.getAttribute('aria-current')).toBe('page');
		expect(current.getAttribute('data-current')).toBe('true');
		expect(byTestId('home').hasAttribute('aria-current')).toBe(false);
	});

	it('is plain text without an href, and says it is current', () => {
		render(BreadcrumbsTest, { currentHref: false });
		const current = byTestId('current');

		expect(current.tagName).toBe('SPAN');
		expect(current.getAttribute('aria-current')).toBe('page');
		expect(current.hasAttribute('href')).toBe(false);
	});

	it('hides the separators from the screen reader, with a slash by default', () => {
		render(BreadcrumbsTest);
		const separators = document.querySelectorAll('[data-breadcrumbs-separator]');

		expect(separators).toHaveLength(2);
		expect(separators[0].getAttribute('aria-hidden')).toBe('true');
		expect(separators[0].textContent?.trim()).toBe('/');
		expect(separators[1].textContent?.trim()).toBe('›');
		// In the item, after the link: the list holds items only.
		expect(separators[0].parentElement?.tagName).toBe('LI');
		expect(separators[0].previousElementSibling).toBe(byTestId('home'));
	});

	it('takes a disabled link out of the tab order, and keeps its text', async () => {
		render(BreadcrumbsTest, { disabled: true });
		const docs = byTestId('docs');

		expect(docs.tagName).toBe('SPAN');
		expect(docs.hasAttribute('href')).toBe(false);
		expect(docs.getAttribute('aria-disabled')).toBe('true');
		expect(docs.getAttribute('data-disabled')).toBe('true');
		expect(docs.textContent?.trim()).toBe('Docs');

		byTestId('before').focus();
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(byTestId('home'));
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(byTestId('current'));
	});

	it('moves through the links with Tab, in the order of the trail', async () => {
		render(BreadcrumbsTest);
		byTestId('before').focus();

		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(byTestId('home'));
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(byTestId('docs'));
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(byTestId('current'));
	});
});
