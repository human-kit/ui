#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGE_NAME = '@human-kit/svelte-components';
const CHANGESET_DIR = '.changeset';

function run(command) {
	return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

function getChangedFiles() {
	const base = process.env.GITHUB_BASE_REF
		? `origin/${process.env.GITHUB_BASE_REF}`
		: 'origin/main';
	try {
		const output = run(`git diff --name-only ${base}...HEAD`);
		return output ? output.split(/\r?\n/).filter(Boolean) : [];
	} catch {
		const output = run('git diff --name-only HEAD');
		return output ? output.split(/\r?\n/).filter(Boolean) : [];
	}
}

function getChangedEntries() {
	const base = process.env.GITHUB_BASE_REF
		? `origin/${process.env.GITHUB_BASE_REF}`
		: 'origin/main';

	let output = '';
	try {
		output = run(`git diff --name-status ${base}...HEAD`);
	} catch {
		output = run('git diff --name-status HEAD');
	}

	if (!output) return [];

	return output
		.split(/\r?\n/)
		.filter(Boolean)
		.map((line) => {
			const parts = line.split('\t');
			const statusToken = parts[0] ?? '';
			const status = statusToken[0] ?? '';
			const filePath = parts[parts.length - 1] ?? '';
			return { status, filePath };
		})
		.filter((entry) => entry.filePath.length > 0);
}

function hasLibrarySourceChanges(files) {
	return files.some((filePath) => filePath.startsWith('packages/svelte/src/'));
}

function hasExistingChangeset() {
	if (!existsSync(CHANGESET_DIR)) return false;
	return readdirSync(CHANGESET_DIR).some((name) => name.endsWith('.md') && name !== 'README.md');
}

function inferBumpType(files) {
	const touchesMainEntrypoint = files.some(
		(filePath) => filePath === 'packages/svelte/src/lib/index.ts'
	);
	const touchesPublicExports = files.some((filePath) =>
		/^packages\/svelte\/src\/lib\/.+\/index\.ts$/.test(filePath)
	);

	if (touchesMainEntrypoint || touchesPublicExports) {
		return 'minor';
	}

	return 'patch';
}

function fallbackSummary(files) {
	const relevant = files
		.filter((filePath) => filePath.startsWith('packages/svelte/src/lib/'))
		.slice(0, 6)
		.map((filePath) => `- Update ${filePath.replace('packages/svelte/src/lib/', '')}`);

	if (relevant.length === 0) {
		return '- Internal maintenance updates.';
	}

	return relevant.join('\n');
}

function normalizeSummary(summary) {
	const normalizedLines = summary
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => line.replace(/^\*\s+/, '- '))
		.map((line) => (line.startsWith('- ') ? line : `- ${line.replace(/^[-*]\s*/, '')}`))
		.slice(0, 4);

	if (normalizedLines.length === 0) {
		return '- Internal maintenance updates.';
	}

	return normalizedLines.join('\n');
}

async function generateAiSummary(files, entries, bumpType) {
	const addedLibraryFiles = entries
		.filter(
			(entry) => entry.status === 'A' && entry.filePath.startsWith('packages/svelte/src/lib/')
		)
		.map((entry) => entry.filePath);

	const prompt = [
		'You are generating a Changeset summary for a Svelte component library.',
		`Package: ${PACKAGE_NAME}`,
		`Proposed bump: ${bumpType}`,
		'Output requirements:',
		'- Return 2-4 markdown bullets, each starting with "- ".',
		'- Be factual and specific to changed behavior/APIs.',
		'- No marketing words (robust, improved overall, enhanced experience, etc.).',
		'- Do not claim a new component unless the added files list clearly supports it.',
		'- Do not include headings, frontmatter, code fences, or extra prose.',
		'Allowed focus areas: API/behavior changes, accessibility, bug fixes, keyboard/focus behavior.',
		`Changed files:\n${files.join('\n')}`,
		`Added library files:\n${addedLibraryFiles.join('\n') || '(none)'}`
	].join('\n\n');

	const geminiApiKey = process.env.GEMINI_API_KEY;
	if (geminiApiKey) {
		try {
			const response = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						system_instruction: {
							parts: [
								{
									text: 'Generate concise release notes in markdown bullet list format for changesets.'
								}
							]
						},
						contents: [{ parts: [{ text: prompt }] }],
						generationConfig: { temperature: 0.2 }
					})
				}
			);

			if (response.ok) {
				const data = await response.json();
				const content = data?.candidates?.[0]?.content?.parts
					?.map((part) => part?.text ?? '')
					.join('')
					.trim();
				if (content) return normalizeSummary(content);
			}
		} catch {
			// Fall through to OpenAI/fallback summary
		}
	}

	const openAiApiKey = process.env.OPENAI_API_KEY;
	if (!openAiApiKey) return null;

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openAiApiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				temperature: 0.2,
				messages: [
					{
						role: 'system',
						content: 'Generate concise release notes in markdown bullet list format for changesets.'
					},
					{ role: 'user', content: prompt }
				]
			})
		});

		if (!response.ok) return null;
		const data = await response.json();
		const content = data?.choices?.[0]?.message?.content?.trim();
		return content ? normalizeSummary(content) : null;
	} catch {
		return null;
	}
}

function slug() {
	const first = ['calm', 'brisk', 'eager', 'gentle', 'lucky', 'neat', 'quick', 'solid'];
	const second = ['otters', 'falcons', 'maps', 'rivers', 'lights', 'rocks', 'leaves', 'clouds'];
	const third = ['align', 'build', 'shift', 'trace', 'guide', 'tune', 'merge', 'refine'];

	const pick = (list) => list[Math.floor(Math.random() * list.length)];
	return `${pick(first)}-${pick(second)}-${pick(third)}`;
}

function buildChangesetMarkdown(bumpType, summary) {
	return `---\n'${PACKAGE_NAME}': ${bumpType}\n---\n\n${summary}\n`;
}

async function main() {
	const args = new Set(process.argv.slice(2));
	const draftMode = args.has('--draft');
	const applyMode = args.has('--apply');
	const onlyIfMissing = args.has('--only-if-missing');

	if (!draftMode && !applyMode) {
		console.error('Use --draft or --apply');
		process.exit(1);
	}

	const files = getChangedFiles();
	const entries = getChangedEntries();
	if (!hasLibrarySourceChanges(files)) {
		console.log('No library source changes detected.');
		process.exit(0);
	}

	if (onlyIfMissing && hasExistingChangeset()) {
		console.log('Changeset already exists. Skipping generation.');
		process.exit(0);
	}

	const bumpType = inferBumpType(files);
	const aiSummary = await generateAiSummary(files, entries, bumpType);
	const summary = aiSummary ?? normalizeSummary(fallbackSummary(files));
	const markdown = buildChangesetMarkdown(bumpType, summary);

	if (draftMode) {
		console.log(markdown);
		return;
	}

	if (!existsSync(CHANGESET_DIR)) {
		mkdirSync(CHANGESET_DIR, { recursive: true });
	}

	const filePath = join(CHANGESET_DIR, `${slug()}.md`);
	writeFileSync(filePath, markdown, 'utf8');
	console.log(filePath);
}

main();
