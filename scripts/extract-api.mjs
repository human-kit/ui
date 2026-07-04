// Extracts component API data (props + data attributes) from packages/ui
// source into docs/src/content/<component>/api.json (Base UI model: generated
// JSON, committed, rendered by <ApiReference> in the docs).
//
// Purely syntactic (ts-morph AST walking, no type checker): works both for
// components with an exported `*Props` type in `types.ts` and for components
// that declare the props type inline in the .svelte `<script lang="ts">`.
//
// Only components that already have a folder under docs/src/content/ are
// processed (opt-in per migrated page). Hand-curated `description` fields in
// an existing api.json are preserved when the extraction yields none.
//
// Usage: pnpm docs:api

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { Node, Project } from 'ts-morph';

const ROOT = process.cwd();
const LIB_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'lib');
const CONTENT_DIR = path.join(ROOT, 'docs', 'src', 'content');

const project = new Project({ useInMemoryFileSystem: true });

async function exists(file) {
	try {
		await stat(file);
		return true;
	} catch {
		return false;
	}
}

/** Parse `export { default as Root } from './root/x.svelte'` entries. */
async function getParts(componentDir) {
	const partsFile = path.join(componentDir, 'index.parts.ts');
	if (await exists(partsFile)) {
		const source = await readFile(partsFile, 'utf-8');
		const parts = [];
		for (const match of source.matchAll(
			/export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*['"]([^'"]+)['"]/g
		)) {
			parts.push({
				name: match[1],
				file: path.join(componentDir, match[2].replace(/\.js$/, ''))
			});
		}
		return parts;
	}

	// Simple component (e.g. input): single .svelte file in the folder root.
	const entries = await readdir(componentDir);
	const svelteFile = entries.find((f) => f.endsWith('.svelte') && !f.endsWith('-test.svelte'));
	return svelteFile ? [{ name: 'Root', file: path.join(componentDir, svelteFile) }] : [];
}

/** Extract the instance `<script lang="ts">` body from a .svelte file. */
function getScriptBody(svelteSource) {
	const scripts = [
		...svelteSource.matchAll(/<script[^>]*lang=["']ts["'][^>]*>([\s\S]*?)<\/script>/g)
	];
	const instance = scripts.find(
		// Include the closing `>` so a trailing `module` attribute still matches.
		(m) => !/context=["']module["']|\smodule[\s>]/.test(m[0].slice(0, m[0].indexOf('>') + 1))
	);
	return (instance ?? scripts[0])?.[1] ?? '';
}

/**
 * Find the props members for a part: the base `*Props` declaration plus any
 * variant declarations extending it (e.g. CalendarRootSingleProps /
 * CalendarRootRangeProps on top of CalendarRootProps), deduped by name.
 */
function collectPropsMembers(sourceFile, partName) {
	const candidates = [...sourceFile.getTypeAliases(), ...sourceFile.getInterfaces()].filter(
		(decl) => decl.getName().endsWith('Props')
	);
	if (candidates.length === 0) return undefined;
	// Prefer the declaration matching the part (e.g. AccordionRootProps for Root).
	const base = candidates.find((d) => d.getName().endsWith(`${partName}Props`)) ?? candidates[0];
	const baseName = base.getName().slice(0, -'Props'.length);
	const variants = candidates.filter((d) => d !== base && d.getName().startsWith(baseName));
	return [base, ...variants].flatMap((decl) => getPropsMembers(decl));
}

/** Collect PropertySignature members from an interface or a (possibly intersected) type literal. */
function getPropsMembers(declaration) {
	if (Node.isInterfaceDeclaration(declaration)) return declaration.getMembers();

	const typeNode = declaration.getTypeNode();
	if (!typeNode) return [];
	if (Node.isTypeLiteral(typeNode)) return typeNode.getMembers();
	if (Node.isIntersectionTypeNode(typeNode)) {
		return typeNode
			.getTypeNodes()
			.filter(Node.isTypeLiteral)
			.flatMap((literal) => literal.getMembers());
	}
	return [];
}

/** Parse `$props()` destructuring defaults from a script body. */
function getPropDefaults(scriptBody) {
	const sourceFile = project.createSourceFile('virtual/defaults.ts', scriptBody, {
		overwrite: true
	});
	const defaults = new Map();
	for (const declaration of sourceFile.getVariableDeclarations()) {
		if (!declaration.getInitializer()?.getText().includes('$props()')) continue;
		const binding = declaration.getNameNode();
		if (!Node.isObjectBindingPattern(binding)) continue;
		for (const element of binding.getElements()) {
			// `class: className = ''` → prop name is the property name, not the binding.
			const propName = (element.getPropertyNameNode() ?? element.getNameNode())
				.getText()
				.replace(/^['"]|['"]$/g, '');
			let initializer = element.getInitializer()?.getText();
			if (initializer === undefined) continue;
			// `element = $bindable()` → no default; `checked = $bindable(false)` → false.
			const bindable = initializer.match(/^\$bindable(?:<[^>]*>)?\((.*)\)$/s);
			if (bindable) {
				if (!bindable[1].trim()) continue;
				initializer = bindable[1].trim();
			}
			defaults.set(propName, initializer);
		}
	}
	return defaults;
}

function extractProps(members, defaults) {
	const props = [];
	const seen = new Set();
	for (const member of members) {
		if (!Node.isPropertySignature(member)) continue;
		const name = member.getName().replace(/^['"]|['"]$/g, '');
		// Skip native event handler passthroughs and variant-duplicated props.
		if (/^on[a-z]/.test(name) || seen.has(name)) continue;
		seen.add(name);
		const jsDoc = member.getJsDocs().at(-1);
		const defaultTag = jsDoc
			?.getTags()
			.find((tag) => tag.getTagName() === 'default')
			?.getCommentText();
		props.push({
			name,
			type: member.getTypeNode()?.getText().replace(/\s+/g, ' ') ?? 'unknown',
			required: !member.hasQuestionToken(),
			default: defaults.get(name) ?? defaultTag ?? null,
			description: jsDoc?.getDescription().trim() ?? ''
		});
	}
	return props;
}

/** Seed the data-attribute list from `data-*` attributes in the part markup. */
function extractDataAttributes(svelteSource) {
	const markup = svelteSource.replace(/<script[\s\S]*?<\/script>/g, '');
	const names = new Set();
	for (const match of markup.matchAll(/(data-[a-z][a-z0-9-]*)\s*(?:=|\s|\/|>)/g)) {
		names.add(match[1]);
	}
	return [...names].sort().map((name) => ({ name, description: '' }));
}

/** Preserve hand-curated descriptions from a previous api.json. */
function mergeDescriptions(part, previousPart) {
	if (!previousPart) return part;
	if (!part.description && previousPart.description) {
		part.description = previousPart.description;
	}
	for (const list of ['props', 'dataAttributes']) {
		const previous = new Map((previousPart[list] ?? []).map((entry) => [entry.name, entry]));
		for (const entry of part[list]) {
			const old = previous.get(entry.name);
			if (!entry.description && old?.description) entry.description = old.description;
		}
	}
	return part;
}

async function extractComponent(component) {
	const componentDir = path.join(LIB_DIR, component);
	if (!(await exists(componentDir))) {
		console.warn(`! ${component}: no matching packages/ui/src/lib/${component} folder, skipped`);
		return;
	}

	const parts = await getParts(componentDir);
	if (parts.length === 0) {
		console.warn(`! ${component}: no parts found, skipped`);
		return;
	}

	const typesFile = path.join(componentDir, 'types.ts');
	const typesSource = (await exists(typesFile)) ? await readFile(typesFile, 'utf-8') : undefined;

	const outFile = path.join(CONTENT_DIR, component, 'api.json');
	const previous = (await exists(outFile))
		? JSON.parse(await readFile(outFile, 'utf-8'))
		: undefined;

	const result = { component, parts: [] };

	for (const part of parts) {
		const svelteSource = await readFile(`${part.file}`, 'utf-8');
		const scriptBody = getScriptBody(svelteSource);

		// Prefer exported types from types.ts; fall back to the inline script type.
		let members;
		if (typesSource) {
			const typesSourceFile = project.createSourceFile('virtual/types.ts', typesSource, {
				overwrite: true
			});
			members = collectPropsMembers(typesSourceFile, part.name);
		}
		if (!members) {
			const scriptSourceFile = project.createSourceFile('virtual/script.ts', scriptBody, {
				overwrite: true
			});
			members = collectPropsMembers(scriptSourceFile, part.name);
		}
		if (!members) {
			console.warn(`! ${component}/${part.name}: no *Props declaration found`);
		}

		const previousPart = previous?.parts?.find((p) => p.name === part.name);
		result.parts.push(
			mergeDescriptions(
				{
					name: part.name,
					description: '',
					props: members ? extractProps(members, getPropDefaults(scriptBody)) : [],
					dataAttributes: extractDataAttributes(svelteSource)
				},
				previousPart
			)
		);
	}

	await writeFile(outFile, JSON.stringify(result, null, '\t') + '\n');
	console.log(
		`✓ ${component}: ${result.parts.length} part(s), ` +
			`${result.parts.reduce((n, p) => n + p.props.length, 0)} props → ${path.relative(ROOT, outFile)}`
	);
}

const components = (await readdir(CONTENT_DIR, { withFileTypes: true }))
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name);

if (components.length === 0) {
	console.log('No component folders under docs/src/content/ — nothing to do.');
}

for (const component of components) {
	await extractComponent(component);
}
