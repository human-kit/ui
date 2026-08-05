// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import MenuContextTriggerTest from './menu-context-trigger-test.svelte';

function getSurfaceTag(source: string) {
	const markerIndex = source.indexOf('data-context-trigger="true"');
	const tagStart = source.lastIndexOf('<', markerIndex);
	const tagEnd = source.indexOf('>', markerIndex);

	if (markerIndex === -1 || tagStart === -1 || tagEnd === -1) return '';
	return source.slice(tagStart, tagEnd + 1);
}

describe('Menu.ContextTrigger SSR', () => {
	it('renders the surface on the server without touching the DOM', () => {
		const { body } = render(MenuContextTriggerTest);
		const surface = getSurfaceTag(body);

		expect(surface).toContain('tabindex="0"');
		expect(surface).toContain('data-state="closed"');
		expect(surface).toContain('aria-keyshortcuts="Shift+F10"');
		// The panel only exists once the menu opens, which is a client-side event.
		expect(body).not.toContain('role="menu"');
	});

	it('marks a disabled surface and drops its shortcut', () => {
		const { body } = render(MenuContextTriggerTest, { props: { disabled: true } });
		const surface = getSurfaceTag(body);

		expect(surface).toContain('data-disabled="true"');
		expect(surface).not.toContain('aria-keyshortcuts');
	});
});
