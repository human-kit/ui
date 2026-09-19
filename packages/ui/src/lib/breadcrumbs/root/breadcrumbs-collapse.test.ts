import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import BreadcrumbsCollapseTest from './breadcrumbs-collapse-test.svelte';

function pages() {
	return Array.from(document.querySelectorAll('[data-testid="item"]')).map((item) =>
		item.textContent?.trim()
	);
}

function ellipsis() {
	return document.querySelector<HTMLButtonElement>('[data-testid="ellipsis"]');
}

describe('Breadcrumbs collapse', () => {
	it('shows every page without a limit, and no ellipsis', () => {
		render(BreadcrumbsCollapseTest);
		expect(pages()).toEqual(['Home', 'Docs', 'Components', 'Navigation', 'Breadcrumbs']);
		expect(ellipsis()).toBeNull();
		expect(document.querySelector('[data-testid="nav"]')?.hasAttribute('data-collapsed')).toBe(
			false
		);
	});

	it('folds the middle past maxItems: the first page, the ellipsis, and the last ones', () => {
		render(BreadcrumbsCollapseTest, { maxItems: 3 });

		expect(pages()).toEqual(['Home', 'Navigation', 'Breadcrumbs']);
		const button = ellipsis();
		expect(button?.tagName).toBe('BUTTON');
		expect(button?.getAttribute('aria-label')).toBe('Show 2 more pages');
		expect(button?.textContent?.trim()).toBe('…');
		expect(button?.closest('li')?.getAttribute('data-breadcrumbs-ellipsis')).toBe('true');
		// The ellipsis sits between the first page and the rest.
		const list = document.querySelector('[data-testid="list"]');
		const children = Array.from(list?.children ?? []).map(
			(child) =>
				child.getAttribute('data-testid') ?? child.getAttribute('data-breadcrumbs-ellipsis')
		);
		expect(children).toEqual(['item', 'true', 'item', 'item']);
		expect(document.querySelector('[data-testid="nav"]')?.getAttribute('data-collapsed')).toBe(
			'true'
		);
	});

	it('does not fold a trail that fits', () => {
		render(BreadcrumbsCollapseTest, { maxItems: 5 });
		expect(pages()).toHaveLength(5);
		expect(ellipsis()).toBeNull();
	});

	it('keeps two pages in view at least', () => {
		render(BreadcrumbsCollapseTest, { maxItems: 1 });
		expect(pages()).toEqual(['Home', 'Breadcrumbs']);
		expect(ellipsis()?.getAttribute('aria-label')).toBe('Show 3 more pages');
	});

	it('unfolds on a press, and moves the focus to the first page that comes into view', async () => {
		const onExpandedChange = vi.fn();
		render(BreadcrumbsCollapseTest, { maxItems: 3, onExpandedChange });

		ellipsis()?.focus();
		await userEvent.keyboard('{Enter}');

		await expect
			.poll(() => pages())
			.toEqual(['Home', 'Docs', 'Components', 'Navigation', 'Breadcrumbs']);
		expect(ellipsis()).toBeNull();
		expect(document.activeElement?.textContent?.trim()).toBe('Docs');
		expect(document.querySelector('[data-testid="expanded"]')?.textContent).toBe('yes');
		expect(onExpandedChange).toHaveBeenCalledWith(true);
	});

	it('speaks the locale', () => {
		render(BreadcrumbsCollapseTest, { maxItems: 3, locale: 'es' });
		expect(ellipsis()?.getAttribute('aria-label')).toBe('Mostrar 2 páginas más');
	});
});
