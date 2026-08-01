// Pre-highlights the package-manager install commands with the SAME shiki
// pipeline the docs code blocks use, so install snippets are coloured
// automatically (no hand-picked token colours). Scans the content for
// `<InstallCommand pkg="…" />` usages, highlights `pnpm/npm/yarn/bun` for each
// package, and writes docs/src/lib/docs/install-commands.json (committed).
// Re-run after adding/changing an install snippet: `pnpm docs:install`.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { highlight } = await import(
	pathToFileURL(resolve(root, 'docs/node_modules/@human-kit/markdown/dist/shiki.js')).href
);

// Collect every package referenced by an <InstallCommand pkg="…" />.
const contentDir = resolve(root, 'docs/src/content');
const pkgs = new Set();
for (const file of readdirSync(contentDir, { recursive: true })) {
	if (typeof file !== 'string' || !file.endsWith('.md')) continue;
	const text = readFileSync(resolve(contentDir, file), 'utf8');
	for (const m of text.matchAll(/<InstallCommand[^>]*\bpkg=["']([^"']+)["']/g)) {
		pkgs.add(m[1]);
	}
}

// pnpm/yarn/bun use `add`; npm uses `install`.
const MANAGERS = { pnpm: 'add', npm: 'install', yarn: 'add', bun: 'add' };

const data = {};
for (const pkg of [...pkgs].sort()) {
	data[pkg] = {};
	for (const [pm, sub] of Object.entries(MANAGERS)) {
		const cmd = `${pm} ${sub} ${pkg}`;
		const full = await highlight(cmd, 'bash');
		// Keep only the inner tokens (drop shiki's <pre> wrapper/background) so the
		// snippet is just coloured text; colours come from the `.shiki` span rules.
		const inner = full.match(/<code>([\s\S]*?)<\/code>/)?.[1] ?? cmd;
		data[pkg][pm] = { cmd, html: inner };
	}
}

const out = resolve(root, 'docs/src/lib/docs/install-commands.json');
writeFileSync(out, JSON.stringify(data, null, '\t') + '\n');
console.log(`wrote ${out}: ${Object.keys(data).length} packages [${Object.keys(data).join(', ')}]`);
