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
			'@human-kit/svelte-components': resolve(__dirname, '../packages/ui/src/lib')
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
