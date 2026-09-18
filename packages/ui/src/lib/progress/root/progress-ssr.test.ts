// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ProgressTest from './progress-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Progress SSR', () => {
	it('renders the numbers and the fill before hydration', () => {
		const { body } = render(ProgressTest, { props: { value: 31 } });

		const bar = getTag(body, 'data-testid="progress"');
		const indicator = getTag(body, 'data-testid="indicator"');

		expect(bar).toContain('role="progressbar"');
		expect(bar).toContain('aria-valuemin="0"');
		expect(bar).toContain('aria-valuemax="100"');
		expect(bar).toContain('aria-valuenow="31"');
		expect(bar).toContain('aria-valuetext="31%"');
		expect(bar).toContain('data-progressing="true"');
		expect(indicator).toContain('width: 31%');
		expect(body).toMatch(/data-testid="value"[^>]*>(<!--[^>]*-->)*31%/);
	});

	it('renders an indeterminate progress without a number', () => {
		const { body } = render(ProgressTest, { props: { value: null } });

		const bar = getTag(body, 'data-testid="progress"');
		const indicator = getTag(body, 'data-testid="indicator"');

		expect(bar).not.toContain('aria-valuenow');
		expect(bar).not.toContain('aria-valuetext');
		expect(bar).toContain('data-indeterminate="true"');
		expect(indicator).not.toContain('width');
	});

	it('takes an aria-label on the server, where the label part cannot register', () => {
		const { body } = render(ProgressTest, {
			props: { value: 31, showLabel: false, ariaLabel: 'Upload' }
		});

		expect(getTag(body, 'data-testid="progress"')).toContain('aria-label="Upload"');
	});
});
