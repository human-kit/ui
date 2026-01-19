import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		alias: {
			$lib: resolve(__dirname, './src/lib'),
			'$app/environment': resolve(__dirname, './src/lib/test-mocks/app-environment.ts'),
			'$app/navigation': resolve(__dirname, './src/lib/test-mocks/app-navigation.ts'),
			'$app/stores': resolve(__dirname, './src/lib/test-mocks/app-stores.ts')
		},
		// Use browser mode for Svelte 5 component tests
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }],
			headless: true,
			screenshotFailures: false
		}
	}
});
