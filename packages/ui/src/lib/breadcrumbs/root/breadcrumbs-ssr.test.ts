// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import BreadcrumbsTest from './breadcrumbs-test.svelte';

describe('Breadcrumbs SSR', () => {
	it('renders the landmark, the list and the current page before hydration', () => {
		const { body } = render(BreadcrumbsTest, { props: { locale: 'fr-FR' } });
		expect(body).toContain('<nav');
		expect(body).toContain(`aria-label="Fil d'Ariane"`);
		expect(body).toContain('<ol');
		expect(body).toContain('aria-current="page"');
		expect(body).toContain('aria-hidden="true"');
	});
});
