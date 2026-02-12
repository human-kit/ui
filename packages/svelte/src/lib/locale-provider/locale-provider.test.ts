import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LocaleProviderTest from './locale-provider-test.svelte';

describe('LocaleProvider', () => {
  it('provides locale through context to Calendar.Root', async () => {
    const screen = render(LocaleProviderTest, { locale: 'es-ES' });
    const heading = screen.getByRole('heading');

    expect(heading.element()?.textContent).toContain('2026');
    expect(heading.element()?.textContent?.toLowerCase()).toContain('feb');
  });
});
