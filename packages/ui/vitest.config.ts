import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*-ssr.test.ts'],
		globals: true,
		// One test file at a time. In parallel, each file runs in its own iframe, and the browser
		// throttles the frames that are off screen and moves the focus between them: presence
		// exits that wait for a frame stall, and a focus that lands on a trigger opens a tooltip
		// nobody asked for. Serial runs cost a minute; the flakes cost a rerun each.
		fileParallelism: false,
		alias: {
			$lib: resolve(__dirname, './src/lib'),
			'$app/environment': resolve(__dirname, './src/lib/test-mocks/app-environment.ts'),
			'$app/navigation': resolve(__dirname, './src/lib/test-mocks/app-navigation.ts'),
			'$app/stores': resolve(__dirname, './src/lib/test-mocks/app-stores.ts')
		},
		browser: {
			enabled: true,
			api: {
				host: '127.0.0.1',
				port: 65121,
				strictPort: false
			},
			provider: playwright(),
			instances: [{ browser: 'chromium' }],
			headless: true,
			screenshotFailures: false
		}
	}
});
