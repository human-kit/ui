import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetDir = path.join(root, 'packages', 'svelte', 'src', 'lib');

function walk(dir, collector) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath, collector);
			continue;
		}
		if (entry.isFile() && entry.name.endsWith('.md')) {
			collector.push(fullPath);
		}
	}
}

function fixTableLine(line) {
	const trimmed = line.trimStart();
	if (!trimmed.startsWith('|')) return line;
	if (/^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(trimmed)) return line;

	return line.replace(/`([^`]+)`/g, (_, content) => {
		const escaped = content.replace(/(?<!\\)\|/g, '\\|');
		return `\`${escaped}\``;
	});
}

const files = [];
walk(targetDir, files);

let changedFiles = 0;
for (const filePath of files) {
	const original = fs.readFileSync(filePath, 'utf8');
	const fixed = original
		.split(/\r?\n/)
		.map((line) => fixTableLine(line))
		.join('\n');

	if (fixed !== original) {
		fs.writeFileSync(filePath, fixed, 'utf8');
		changedFiles += 1;
	}
}

console.log(`MD056 fix applied to ${changedFiles} file(s).`);
