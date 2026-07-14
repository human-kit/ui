import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LocaleProviderTest from './locale-provider-test.svelte';
import LocaleProviderInitialValueTest from './locale-provider-initial-value-test.svelte';

describe('LocaleProvider', () => {
	it('provides initial locale value immediately to context subscribers', () => {
		const seenValues: Array<string | undefined> = [];

		render(LocaleProviderInitialValueTest, {
			locale: 'fr-FR',
			onValue: (value: string | undefined) => {
				seenValues.push(value);
			}
		});

		expect(seenValues[0]).toBe('fr-FR');
		expect(seenValues).not.toContain(undefined);
	});

	it('provides locale through context to Calendar.Root', async () => {
		const screen = render(LocaleProviderTest, { locale: 'es-ES' });
		const heading = screen.getByRole('heading');

		expect(heading.element()?.textContent).toContain('2026');
		expect(heading.element()?.textContent?.toLowerCase()).toContain('feb');
	});
});
