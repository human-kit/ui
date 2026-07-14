import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ApiReference from './api-reference.svelte';
import type { ComponentApi } from '../../api-types.js';

const API: ComponentApi = {
	component: 'Widget',
	parts: [
		{
			name: 'Root',
			description: 'The root element.',
			props: [
				{ name: 'value', type: 'string', required: false, default: '""', description: 'The value.' }
			],
			dataAttributes: [{ name: 'data-open', description: 'Present when open.' }]
		}
	]
};

describe('ApiReference', () => {
	it('renders a heading per part with a stable slug id', () => {
		render(ApiReference, { api: API });
		const heading = document.querySelector('h3#api-root');
		expect(heading?.textContent).toBe('Root');
	});

	it('renders the part props and data attributes', () => {
		render(ApiReference, { api: API });
		const text = document.body.textContent ?? '';
		expect(text).toContain('value'); // prop row
		expect(text).toContain('data-open'); // data attribute row
		expect(text).toContain('Present when open.');
	});
});
