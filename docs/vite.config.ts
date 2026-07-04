import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { readFile } from 'node:fs/promises';
import path from 'path';
import { highlight } from './src/lib/docs/highlighter.js';

/**
 * Resolves `./demo.svelte?highlight` imports to `{ code, html }`: the raw
 * source plus its shiki-highlighted HTML, generated at build time so no
 * highlighting JS ships to the client.
 */
const HIGHLIGHT_PREFIX = '\0demo-highlight:';
const HIGHLIGHT_SUFFIX = '.highlighted';

function demoSource(): Plugin {
	return {
		name: 'demo-source',
		enforce: 'pre',
		async resolveId(source, importer) {
			if (!source.endsWith('?highlight')) return;
			const resolved = await this.resolve(source.slice(0, -'?highlight'.length), importer, {
				skipSelf: true
			});
			if (!resolved) return;
			// Virtual id that no longer ends in `.svelte`, so vite-plugin-svelte
			// does not try to compile the emitted JS as a Svelte component.
			return HIGHLIGHT_PREFIX + resolved.id + HIGHLIGHT_SUFFIX;
		},
		async load(id) {
			if (!id.startsWith(HIGHLIGHT_PREFIX)) return;
			const file = id.slice(HIGHLIGHT_PREFIX.length, -HIGHLIGHT_SUFFIX.length);
			this.addWatchFile(file);
			const code = (await readFile(file, 'utf-8')).trim();
			const html = await highlight(code, 'svelte');
			return `export default ${JSON.stringify({ code, html })};`;
		}
	};
}

export default defineConfig(() => ({
	plugins: [demoSource(), tailwindcss(), sveltekit(), devtoolsJson()],
	resolve: {
		alias: {
			'@human-kit/ui': path.resolve(__dirname, '../packages/ui/src/lib')
		}
	}
}));
