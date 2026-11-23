// Measures the gzip size of fixed charts. Each fixture is a small app; the size is the
// minified bundle without the Svelte runtime, which the application has in all cases.
// Usage: node scripts/chart-size.mjs [--json]
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, sep } from 'node:path';
import { build } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const root = dirname(fileURLToPath(import.meta.url));
const fixtures = readdirSync(join(root, 'chart-size-fixtures')).filter((f) =>
	f.endsWith('.svelte')
);

async function measure(file, external) {
	const entry = `\0entry:${basename(file, '.svelte')}.js`;
	const result = await build({
		logLevel: 'silent',
		configFile: false,
		plugins: [
			svelte({ preprocess: vitePreprocess(), compilerOptions: { runes: true } }),
			{
				name: 'entry',
				resolveId: (id) => (id === entry ? id : null),
				load: (id) =>
					id === entry
						? `import { mount } from 'svelte';\nimport App from ${JSON.stringify(join(root, 'chart-size-fixtures', file).split(sep).join('/'))};\nmount(App, { target: document.body, props: { data: [] } });`
						: null
			}
		],
		build: {
			write: false,
			minify: true,
			target: 'es2022',
			rollupOptions: {
				input: entry,
				external: external ? (id) => /^svelte(\/|$)/.test(id) : []
			}
		}
	});
	const output = (Array.isArray(result) ? result[0] : result).output;
	const code = output
		.filter((chunk) => chunk.type === 'chunk')
		.map((chunk) => chunk.code)
		.join('\n');
	return {
		min: Buffer.byteLength(code),
		gzip: gzipSync(code, { level: 9 }).length,
		brotli: brotliCompressSync(code).length
	};
}

const rows = [];
for (const file of fixtures) {
	const library = await measure(file, true);
	const total = await measure(file, false);
	rows.push({ fixture: basename(file, '.svelte'), library, total });
}

if (process.argv.includes('--json')) {
	console.log(JSON.stringify(rows, null, 2));
} else {
	const kb = (n) => `${(n / 1024).toFixed(2)} kB`;
	console.log('fixture        library min   library gzip   library brotli   with svelte gzip');
	for (const { fixture, library, total } of rows) {
		console.log(
			`${fixture.padEnd(14)} ${kb(library.min).padStart(11)}   ${kb(library.gzip).padStart(12)}   ${kb(library.brotli).padStart(14)}   ${kb(total.gzip).padStart(16)}`
		);
	}
}
