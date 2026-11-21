// Checks that each relative import in the library names the file that will exist after the
// package is built. Node's ESM loader and TypeScript with `moduleResolution: node16` or
// `nodenext` do not guess: `./types` must be `./types.js`, `./context.svelte` must be
// `./context.svelte.js` when the source is `context.svelte.ts`, and `./listbox` must be
// `./listbox/index.js`. `svelte-package` copies the specifiers as they are written, and the
// repo itself compiles with `moduleResolution: bundler`, which accepts all three, so only
// this check can see the difference.
//
//   node scripts/check-import-extensions.mjs          report, and exit 1 if any is wrong
//   node scripts/check-import-extensions.mjs --fix    rewrite them in place
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'packages/ui/src/lib';
const fix = process.argv.includes('--fix');

const files = [];
(function walk(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const full = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (/\.(ts|js|svelte)$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
			files.push(full);
	}
})(ROOT);

const isFile = (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile();

// What the specifier must be, or null if it is already right or is not ours to judge.
function correct(importer, specifier) {
	const target = path.resolve(path.dirname(importer), specifier);
	if (/\.(js|css|json)$/.test(specifier)) return null;
	if (specifier.endsWith('.svelte')) {
		// A component keeps its name. A module in `x.svelte.ts` is built to `x.svelte.js`.
		if (isFile(target)) return null;
		return isFile(`${target}.ts`) || isFile(`${target}.js`) ? `${specifier}.js` : null;
	}
	if (specifier.endsWith('.ts')) return specifier.replace(/\.ts$/, '.js');
	if (isFile(`${target}.ts`) || isFile(`${target}.js`)) return `${specifier}.js`;
	if (isFile(`${target}.svelte.ts`) || isFile(`${target}.svelte.js`))
		return `${specifier}.svelte.js`;
	if (isFile(path.join(target, 'index.ts')) || isFile(path.join(target, 'index.js'))) {
		return `${specifier.replace(/\/$/, '')}/index.js`;
	}
	return null;
}

// `from '…'`, `import '…'` and `import('…')`, for a specifier that starts with `./` or `../`.
const pattern = /(\bfrom\s+|\bimport\s+|\bimport\(\s*)(['"])(\.{1,2}(?:\/[^'"]*)?)\2/g;

const wrong = [];
for (const file of files) {
	const source = fs.readFileSync(file, 'utf8');
	const result = source.replace(pattern, (match, lead, quote, specifier) => {
		const right = correct(file, specifier);
		if (!right) return match;
		wrong.push(`${file.split(path.sep).join('/')}: '${specifier}' must be '${right}'`);
		return `${lead}${quote}${right}${quote}`;
	});
	if (fix && result !== source) fs.writeFileSync(file, result);
}

if (wrong.length === 0) {
	console.log('Import extensions: all relative imports name their built file.');
} else if (fix) {
	console.log(`Import extensions: fixed ${wrong.length} imports.`);
} else {
	console.error(wrong.join('\n'));
	console.error(
		`\n${wrong.length} relative imports do not name their built file. ` +
			'Run `node scripts/check-import-extensions.mjs --fix`.'
	);
	process.exit(1);
}
