// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import TableSsrWrapperTest from './table-ssr-wrapper-test.svelte';

describe('Table.Root SSR', () => {
	it('renders registry-driven wrapper columns and cells on the server render pass', () => {
		const { body } = render(TableSsrWrapperTest);

		expect(body).toContain('Email');
		expect(body).toContain('Group');
		expect(body).toContain('danilo@example.com');
		expect(body).toContain('Developer');
	});
});
