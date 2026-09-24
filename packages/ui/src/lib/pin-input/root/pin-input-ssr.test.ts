// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import PinInputTest from './pin-input-test.svelte';

function getTag(source: string, marker: string) {
	const markerIndex = source.indexOf(marker);
	if (markerIndex === -1) return '';
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);
	if (tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('PinInput SSR', () => {
	it('renders the group, the characters and the names before hydration', () => {
		const { body } = render(PinInputTest, { props: { defaultValue: '12' } });

		expect(getTag(body, 'data-testid="root"')).toContain('role="group"');
		expect(getTag(body, 'data-testid="cell-0"')).toContain('value="1"');
		expect(getTag(body, 'data-testid="cell-0"')).toContain('aria-label="Digit 1 of 4"');
		expect(getTag(body, 'data-testid="cell-1"')).toContain('data-filled="true"');
		expect(getTag(body, 'data-testid="cell-2"')).toContain('data-active="true"');
	});

	it('renders the code of a message with its own name and autocomplete', () => {
		const { body } = render(PinInputTest, { props: { otp: true, withLabel: false } });

		expect(getTag(body, 'data-testid="root"')).toContain('aria-label="Verification code"');
		expect(getTag(body, 'data-testid="cell-0"')).toContain('autocomplete="one-time-code"');
	});

	it('reports nothing while rendering', () => {
		const changes: unknown[] = [];

		render(PinInputTest, {
			props: { defaultValue: '12', onChange: (value: unknown) => changes.push(value) }
		});

		expect(changes).toEqual([]);
	});
});
