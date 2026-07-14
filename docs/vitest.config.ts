import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';

// Browser-mode tests for the docs app (real Chromium via Playwright), mirroring
// the library's setup in ../packages/ui. Used for behaviour that only manifests
// in a real browser with component lifecycle — e.g. the TOC registry across
// client-side page swaps.
export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		alias: {
			'@human-kit/ui': resolve(__dirname, '../packages/ui/src/lib'),
			// SvelteKit isn't loaded under vitest, so `$app/*` is stubbed (see
			// src/lib/docs/test-stubs). Lets components that read the route/theme render.
			'$app/environment': resolve(__dirname, 'src/lib/docs/test-stubs/app-environment.ts'),
			'$app/paths': resolve(__dirname, 'src/lib/docs/test-stubs/app-paths.ts'),
			'$app/state': resolve(__dirname, 'src/lib/docs/test-stubs/app-state.svelte.ts')
		},
		browser: {
			enabled: true,
			api: { host: '127.0.0.1', port: 65122, strictPort: false },
			provider: playwright(),
			instances: [{ browser: 'chromium' }],
			headless: true,
			screenshotFailures: false
		}
	}
});
