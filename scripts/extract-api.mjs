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
function collectPropsDeclarations(sourceFile, partName, componentPascal, otherPartTypeNames) {
	const candidates = [...sourceFile.getTypeAliases(), ...sourceFile.getInterfaces()].filter(
		(decl) => decl.getName().endsWith('Props')
	);
	if (candidates.length === 0) return undefined;
	// Prefer the exact `<Component><Part>Props` name (TableCellProps over the
	// unrelated CellProps), then any declaration matching the part suffix.
	const base =
		(componentPascal &&
			candidates.find((d) => d.getName() === `${componentPascal}${partName}Props`)) ||
		candidates.find((d) => d.getName().endsWith(`${partName}Props`)) ||
		candidates[0];
	const baseName = base.getName().slice(0, -'Props'.length);
	// Variant declarations (TableBodyItemsProps on top of TableBodyProps), but
	// never another part's own type (TableColumnResizerProps is ColumnResizer's,
	// not a Column variant).
	const variants = candidates.filter(
		(d) => d !== base && d.getName().startsWith(baseName) && !otherPartTypeNames?.has(d.getName())
	);
	return [base, ...variants];
}

/**
 * Find wrapped-component references in the props declarations:
 * `ComponentProps<typeof X>` (optionally inside `Omit<..., 'a' | 'b'>`),
 * where X is `SomeImport` or `Namespace.Part`. Returns
 * `[{ expr, excluded: Set<string> }]` for each reference found.
 */
function findWrappedRefs(declarations) {
	const refs = [];

	function visit(typeNode, excluded) {
		if (!typeNode) return;
		if (Node.isIntersectionTypeNode(typeNode)) {
			for (const node of typeNode.getTypeNodes()) visit(node, excluded);
			return;
		}
		if (!Node.isTypeReference(typeNode)) return;
		const name = typeNode.getTypeName().getText();
		const args = typeNode.getTypeArguments();
		if (name === 'Omit' && args.length === 2) {
			const keys = new Set(excluded);
			// Collect 'a' | 'b' string-literal keys (single literal or union).
			const keyNodes = Node.isUnionTypeNode(args[1]) ? args[1].getTypeNodes() : [args[1]];
			for (const keyNode of keyNodes) {
				const literal = keyNode.getText().match(/^['"](.+)['"]$/);
				if (literal) keys.add(literal[1]);
			}
			visit(args[0], keys);
			return;
		}
		if (name === 'ComponentProps' && args.length === 1 && Node.isTypeQuery(args[0])) {
			refs.push({ expr: args[0].getExprName().getText(), excluded });
		}
	}

	for (const decl of declarations) {
		if (!Node.isTypeAliasDeclaration(decl)) continue;
		visit(decl.getTypeNode(), new Set());
	}
	return refs;
}

/**
 * Resolve a wrapped-component expression (`ListBoxItem` or `Popover.Content`)
 * to its .svelte file, using the importing file's import statements.
 */
async function resolveWrappedFile(expr, importerSource, importerDir) {
	const [ident, qualifiedPart] = expr.split('.');
	const defaultImport = importerSource.match(
		new RegExp(`import\\s+${ident}\\s+from\\s+['"]([^'"]+)['"]`)
	);
	// named import: `import { Popover } from '...'` / `import { ListBoxRoot as ListBox } from '...'`
	const namedImport = importerSource.match(
		new RegExp(
			`import\\s*(?:type\\s*)?\\{([^}]*\\b${ident}\\b[^}]*)\\}\\s*from\\s+['"]([^'"]+)['"]`
		)
	);
	const importMatch = defaultImport ?? namedImport;
	if (!importMatch) return undefined;

	// Aliased named import: resolve the original exported name.
	let originalName = ident;
	if (!defaultImport) {
		const alias = namedImport[1].match(new RegExp(`(\\w+)\\s+as\\s+${ident}\\b`));
		if (alias) originalName = alias[1];
	}
	const spec = (defaultImport ? importMatch[1] : namedImport[2]).replace(/\.js$/, '');
	const resolved = path.resolve(importerDir, spec);

	// Direct .svelte import.
	if (!qualifiedPart) {
		const file = spec.endsWith('.svelte') ? resolved : `${resolved}.svelte`;
		if (await exists(file)) return file;
	}
	// Component-folder import: look the part up in its index.parts.ts, either
	// as `Namespace.Part` or as a flat alias (`ListBoxRoot` -> part `Root`).
	for (const dir of [resolved, path.dirname(resolved)]) {
		if (!(await exists(path.join(dir, 'index.parts.ts')))) continue;
		const parts = await getParts(dir);
		if (qualifiedPart) return parts.find((p) => p.name === qualifiedPart)?.file;
		return parts
			.filter((p) => originalName.endsWith(p.name))
			.sort((a, b) => b.name.length - a.name.length)[0]?.file;
	}
	return undefined;
}

/** Collect PropertySignature members from an interface or a (possibly intersected) type literal. */
function getPropsMembers(declaration, depth = 0) {
	if (Node.isInterfaceDeclaration(declaration)) return declaration.getMembers();
	return typeNodeMembers(declaration.getTypeNode(), declaration.getSourceFile(), depth);
}

function typeNodeMembers(typeNode, sourceFile, depth) {
	if (!typeNode || depth > 3) return [];
	if (Node.isTypeLiteral(typeNode)) return typeNode.getMembers();
	if (Node.isIntersectionTypeNode(typeNode)) {
		return typeNode.getTypeNodes().flatMap((node) => typeNodeMembers(node, sourceFile, depth + 1));
	}
	// Follow references to local aliases (TableInteractiveCellProps = TableCellProps).
	// Foreign references (Omit<...>, HTMLAttributes) resolve to nothing here.
	if (Node.isTypeReference(typeNode)) {
		const name = typeNode.getTypeName().getText();
		const local = sourceFile.getTypeAlias(name) ?? sourceFile.getInterface(name);
		if (local) return getPropsMembers(local, depth + 1);
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

/**
 * Extract the prop objects for a part, following `ComponentProps<typeof X>`
 * wrapper references into the wrapped component's own props (Omit keys
 * excluded, wrapper-declared props and defaults winning over wrapped ones).
 * Returns undefined when no *Props declaration exists at all.
 */
async function extractPartProps({
	partFile,
	partName,
	scriptBody,
	typesSource,
	componentPascal,
	otherPartTypeNames,
	depth = 0
}) {
	// Prefer exported types from types.ts; fall back to the inline script type.
	let declarations;
	let declarationSource = scriptBody;
	if (typesSource) {
		const typesSourceFile = project.createSourceFile(`virtual/types-${depth}.ts`, typesSource, {
			overwrite: true
		});
		declarations = collectPropsDeclarations(
			typesSourceFile,
			partName,
			componentPascal,
			otherPartTypeNames
		);
		declarationSource = typesSource;
	}
	if (!declarations) {
		const scriptSourceFile = project.createSourceFile(`virtual/script-${depth}.ts`, scriptBody, {
			overwrite: true
		});
		declarations = collectPropsDeclarations(
			scriptSourceFile,
			partName,
			componentPascal,
			otherPartTypeNames
		);
		declarationSource = scriptBody;
	}
	if (!declarations) return undefined;

	const ownMembers = declarations.flatMap((decl) => getPropsMembers(decl));
	const ownDefaults = getPropDefaults(scriptBody);
	const props = extractProps(ownMembers, ownDefaults);

	if (depth >= 2) return props;
	// findWrappedRefs invalidates nothing, but the recursive extractPartProps
	// call below reuses the virtual source files — so gather the refs (plain
	// data) before recursing.
	const wrappedRefs = findWrappedRefs(declarations).map((ref) => ({ ...ref }));

	for (const ref of wrappedRefs) {
		const wrappedFile = await resolveWrappedFile(
			ref.expr,
			declarationSource,
			path.dirname(partFile)
		);
		if (!wrappedFile) {
			console.warn(`! could not resolve wrapped component "${ref.expr}" from ${partFile}`);
			continue;
		}
		const wrappedSource = await readFile(wrappedFile, 'utf-8');
		const wrappedProps = await extractPartProps({
			partFile: wrappedFile,
			partName: ref.expr.split('.').pop(),
			scriptBody: getScriptBody(wrappedSource),
			typesSource: undefined,
			depth: depth + 1
		});
		const seen = new Set(props.map((p) => p.name));
		for (const prop of wrappedProps ?? []) {
			if (ref.excluded.has(prop.name) || seen.has(prop.name)) continue;
			seen.add(prop.name);
			// The wrapper's own $props() defaults override the wrapped ones.
			props.push({ ...prop, default: ownDefaults.get(prop.name) ?? prop.default });
		}
	}
	return props;
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

	const componentPascal = component
		.split('-')
		.map((s) => s[0].toUpperCase() + s.slice(1))
		.join('');
	const result = { component, parts: [] };

	for (const part of parts) {
		const svelteSource = await readFile(`${part.file}`, 'utf-8');
		const scriptBody = getScriptBody(svelteSource);

		const props = await extractPartProps({
			partFile: part.file,
			partName: part.name,
			scriptBody,
			typesSource,
			componentPascal,
			otherPartTypeNames: new Set(
				parts.filter((p) => p.name !== part.name).map((p) => `${componentPascal}${p.name}Props`)
			)
		});
		if (props === undefined) {
			console.warn(`! ${component}/${part.name}: no *Props declaration found`);
		}

		const previousPart = previous?.parts?.find((p) => p.name === part.name);
		result.parts.push(
			mergeDescriptions(
				{
					name: part.name,
					description: '',
					props: props ?? [],
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
