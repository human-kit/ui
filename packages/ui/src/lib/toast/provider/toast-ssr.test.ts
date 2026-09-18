// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ToastTest from './toast-test.svelte';

describe('Toast SSR', () => {
	it('renders the announcers and no region without a toast', () => {
		const { body } = render(ToastTest, { props: {} });

		expect(body).toContain('role="status"');
		expect(body).toContain('role="alert"');
		expect(body).not.toContain('data-toast-viewport');
	});
});
