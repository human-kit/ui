#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const targetFilePattern = /TODO\.md$/;
const checkboxLinePattern = /^\s*-\s*\[( |x|X)\]/;
const requiredTodoPattern =
	/^\s*-\s*\[( |x|X)\]\s+\[(M|S|C|W)\]\[(P[0-3])\]\[Area:\s*[^\]]+\]\[Owner:\s*[^\]]+\]\[Target:\s*[^\]]+\]\s+.+$/;

async function collectTodoFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (
				entry.name === 'node_modules' ||
				entry.name === '.git' ||
				entry.name === '.changeset' ||
				entry.name === 'dist' ||
				entry.name === '.svelte-kit'
			) {
				continue;
			}
			files.push(...(await collectTodoFiles(fullPath)));
			continue;
		}

		if (targetFilePattern.test(entry.name)) {
			files.push(fullPath);
		}
	}

	return files;
}

function toRelativePath(filePath) {
	return filePath.replace(`${rootDir}\\`, '').replace(/\\/g, '/');
}

async function validateTodoFile(filePath) {
	const content = await readFile(filePath, 'utf8');
	const lines = content.split(/\r?\n/);
	const violations = [];

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		if (!checkboxLinePattern.test(line)) {
			continue;
		}

		if (!requiredTodoPattern.test(line)) {
			violations.push({ lineNumber: index + 1, line });
		}
	}

	return violations;
}

async function main() {
	const todoFiles = await collectTodoFiles(rootDir);
	const allViolations = [];

	for (const filePath of todoFiles) {
		const violations = await validateTodoFile(filePath);
		if (violations.length > 0) {
			allViolations.push({ filePath, violations });
		}
	}

	if (allViolations.length === 0) {
		console.log(`TODO format check passed (${todoFiles.length} files).`);
		process.exit(0);
	}

	console.error('TODO format check failed. Each checkbox item must use:');
	console.error('- [ ] [M|S|C|W][P0|P1|P2|P3][Area: ...][Owner: ...][Target: ...] Description');
	console.error('');

	for (const result of allViolations) {
		console.error(`${toRelativePath(result.filePath)}:`);
		for (const violation of result.violations) {
			console.error(`  L${violation.lineNumber}: ${violation.line}`);
		}
	}

	process.exit(1);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
