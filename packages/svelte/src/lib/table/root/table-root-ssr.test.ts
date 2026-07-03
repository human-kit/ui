// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TableSsrWrapperTest from './table-ssr-wrapper-test.svelte';
import TableSsrMinWidthTest from './table-root-ssr-min-width-test.svelte';

describe('Table.Root SSR', () => {
	it('renders registry-driven wrapper columns and cells on the server render pass', () => {
		const { body } = render(TableSsrWrapperTest);

		expect(body).toContain('Email');
		expect(body).toContain('Group');
		expect(body).toContain('danilo@example.com');
		expect(body).toContain('Developer');
	});

	it('reserves ssrMinTableWidth on the server so the table does not grow on hydration', () => {
		const { body } = render(TableSsrMinWidthTest);

		const tableTag = body.match(/<table[^>]*>/)?.[0] ?? '';
		// The columns only register after the <table> serializes, so the table
		// cannot derive its own minimum width yet — ssrMinTableWidth fills that
		// gap and commits the table to a fixed layout up-front.
		expect(tableTag).toContain('min-width: 1058px');
		expect(tableTag).toContain('table-layout: fixed');
	});
});
