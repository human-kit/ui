/**
 * Writes the `api.json` of each docs page from the code: the props and their JSDoc
 * from the `*Props` types, and the defaults from the `$props()` of each part.
 *
 * Run it with `pnpm docs:api` after a change to a prop. The files are committed,
 * and the docs read them through `<ApiReference>`.
 *
 * The generic `hk-extract-api` CLI does not fit the charts: it looks for one
 * folder per page with an `index.parts.ts` or a `types.ts`, and here all of the
 * prop types are in `chart/types.ts` and a mark gets its point attributes from
 * a spread. Thus the parts of each page, the part descriptions and the data
 * attributes are written below, and only the props come from the code.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Node, Project } from 'ts-morph';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lib = resolve(root, 'packages/ui/src/lib/chart');
const content = resolve(root, 'docs/src/content');

const project = new Project({ skipAddingFilesFromTsConfig: true });
const sources = ['types.ts', 'root/context.ts', 'scales/types.ts'].map((file) =>
	project.addSourceFileAtPath(resolve(lib, file))
);

/** The attributes that each point of a mark gets from the root. */
const POINT = [
	['data-point', 'On each point: a circle, a rect for a bar, or a path for a dot or a slice.'],
	['data-focused', 'On the point that has the focus.'],
	['data-focus-visible', 'On the focused point, when the focus came from the keyboard.'],
	['data-selected', 'On the selected point. The point also has `aria-current="true"`.']
];

/** A part of a page: a component, or a type that a prop or a snippet gives. */
const PAGES = {
	chart: [
		{
			name: 'Root',
			type: 'ChartRootProps',
			file: 'root/chart-root.svelte',
			element: 'figure',
			description:
				'The chart. It makes a `<figure>`, holds the data and the scales, and controls the focus and the selection of the points.',
			dataAttributes: [
				['data-chart', 'Always on the root.'],
				['data-focus-within', 'When a point of the chart has the focus.'],
				['data-focus-visible', 'When the focused point shows the focus ring.']
			]
		},
		{
			name: 'Title',
			type: 'ChartTitleProps',
			file: 'title/chart-title.svelte',
			element: 'figcaption',
			description:
				'The title. It makes a `<figcaption>`, and it gives the chart its accessible name.',
			dataAttributes: []
		},
		{
			name: 'Plot',
			type: 'ChartPlotProps',
			file: 'plot/chart-plot.svelte',
			element: 'svg',
			description:
				'The plot. It makes the `<svg>` that holds the marks and the guides, and it has the keyboard handlers.',
			dataAttributes: [['data-plot', 'Always on the SVG element.']]
		},
		{
			name: 'ChartPoint',
			type: 'ChartPoint',
			description: 'A point, as `focused`, `selected` and `onSelect` give it.',
			dataAttributes: []
		}
	],
	'chart-line': [
		{
			name: 'Line',
			type: 'ChartLineProps',
			file: 'line/chart-line.svelte',
			description: 'A line mark. It makes one `<path>` per series, and one circle per row.',
			dataAttributes: [
				['data-mark', 'On the group of the mark. The value is `line`.'],
				['data-series', 'On the group of each series. The value is the name of the series.'],
				['data-line', 'On the path of each series.'],
				...POINT
			]
		}
	],
	'chart-area': [
		{
			name: 'Area',
			type: 'ChartAreaProps',
			file: 'area/chart-area.svelte',
			description:
				'An area mark. It makes one filled `<path>` and one line per series. The points show only when they have the focus.',
			dataAttributes: [
				['data-mark', 'On the group of the mark. The value is `area`.'],
				['data-stacked', 'On the group of the mark, when `stacked` is `true`.'],
				['data-series', 'On the group of each series. The value is the name of the series.'],
				['data-area', 'On the filled path of each series.'],
				['data-line', 'On the top line of each series.'],
				...POINT
			]
		}
	],
	'chart-bar': [
		{
			name: 'Bar',
			type: 'ChartBarProps',
			file: 'bar/chart-bar.svelte',
			description: 'A bar mark. It makes one `<rect>` per row.',
			dataAttributes: [
				['data-mark', 'On the group of the mark. The value is `bar`.'],
				['data-layout', 'On the group of the mark: `grouped` or `stacked`.'],
				['data-orientation', 'On the group of the mark: `vertical` or `horizontal`.'],
				['data-series', 'On the group of each series. The value is the name of the series.'],
				['data-bar', 'On each bar.'],
				['data-negative', 'On a bar with a value below zero.'],
				...POINT
			]
		}
	],
	'chart-dot': [
		{
			name: 'Dot',
			type: 'ChartDotProps',
			file: 'dot/chart-dot.svelte',
			description: 'A dot mark. It makes one `<path>` per row, in the shape of its series.',
			dataAttributes: [
				['data-mark', 'On the group of the mark. The value is `dot`.'],
				['data-series', 'On the group of each series. The value is the name of the series.'],
				['data-symbol', 'On the group of each series. The value is the name of the shape.'],
				...POINT
			]
		}
	],
	'chart-arc': [
		{
			name: 'Arc',
			type: 'ChartArcProps',
			file: 'arc/chart-arc.svelte',
			description:
				'An arc mark for pie and donut charts. It makes one `<path>` per row, a slice of a circle.',
			dataAttributes: [
				['data-mark', 'On the group of the mark. The value is `arc`.'],
				['data-series', 'On the group of the series. The value is the name of the series.'],
				['data-category', 'On each slice and each label. The value is the x value of the row.'],
				['data-arc-labels', 'On the group of the labels.'],
				['data-arc-label', 'On each label.'],
				...POINT
			]
		}
	],
	'chart-axis-and-grid': [
		{
			name: 'Axis',
			type: 'ChartAxisProps',
			file: 'axis/chart-axis.svelte',
			description: 'The ticks, the tick labels and the label of one axis.',
			dataAttributes: [
				['data-axis', 'On the group of the axis. The value is the `position`.'],
				['data-axis-line', 'On the line along the plot.'],
				['data-tick', 'On the group of each tick: its line and its label.'],
				['data-axis-label', 'On the text of the `label`.']
			]
		},
		{
			name: 'Grid',
			type: 'ChartGridProps',
			file: 'grid/chart-grid.svelte',
			description: 'The grid lines of one axis, one line at each tick.',
			dataAttributes: [['data-grid', 'On the group of the lines. The value is the `axis`.']]
		}
	],
	'chart-legend': [
		{
			name: 'Legend',
			type: 'ChartLegendProps',
			file: 'legend/chart-legend.svelte',
			element: 'ul',
			description: 'A list of the series of the chart. It makes a `<ul>` with one item per series.',
			dataAttributes: [
				['data-legend', 'On the list.'],
				['data-legend-item', 'On each item.'],
				['data-series', 'On each item of a series. The value is the name of the series.'],
				[
					'data-category',
					'On each item of an arc mark, in place of `data-series`. The value is the category.'
				],
				[
					'data-symbol',
					'On each item of a series with a shape. The value is the name of the shape.'
				],
				[
					'data-swatch',
					'On the element at the start of an item without children. It holds an SVG of the shape of a series with a shape.'
				]
			]
		}
	],
	'chart-tooltip': [
		{
			name: 'Tooltip',
			type: 'ChartTooltipProps',
			file: 'tooltip/chart-tooltip.svelte',
			element: 'div',
			description:
				'A box near the point under the pointer, or near the point that has the keyboard focus.',
			dataAttributes: [
				['data-tooltip', 'On the box.'],
				['data-series', 'On the box. The value is the name of the series of the point.'],
				['data-tooltip-key', 'On the line with the category or the x value.'],
				['data-tooltip-value', 'On the line with the series and the value.'],
				['data-tooltip-series', 'On the name of the series.']
			]
		},
		{
			name: 'ChartTooltipState',
			type: 'ChartTooltipState',
			description: 'The value that the children snippet receives.',
			dataAttributes: []
		}
	],
	'chart-data-table': [
		{
			name: 'DataTable',
			type: 'ChartDataTableProps',
			file: 'data-table/chart-data-table.svelte',
			element: 'table',
			description:
				'A `<table>` with all of the values of the chart: one row per category or x value, and one column per series.',
			dataAttributes: [
				['data-data-table', 'On the table.'],
				['data-visibility', 'On the table: `visible` or `screen-reader`.'],
				[
					'data-selected',
					'On the cell of the selected point, or on the row of a selected dot or slice.'
				]
			]
		}
	],
	'chart-scales': [
		{
			name: 'ScaleOptions',
			type: 'ScaleOptions',
			description: 'The value of the `xScale` and `yScale` props of `Chart.Root`.',
			dataAttributes: []
		},
		{
			name: 'Scale',
			type: 'Scale',
			description: 'The function that a scale type makes. It maps a value to a position in pixels.',
			dataAttributes: []
		}
	]
};

function findType(name) {
	for (const source of sources) {
		const found = source.getTypeAlias(name) ?? source.getInterface(name);
		if (found) return found;
	}
	return undefined;
}

/** The members of a union of prop sets. They are optional, also without a question token. */
const optional = new WeakSet();

/** The members that a type declares, with the `Omit` of a local type resolved. */
function members(typeNode, excluded = new Set()) {
	if (!typeNode) return [];
	if (Node.isTypeLiteral(typeNode)) {
		return typeNode.getMembers().filter((m) => !excluded.has(memberName(m)));
	}
	if (Node.isIntersectionTypeNode(typeNode)) {
		return typeNode.getTypeNodes().flatMap((node) => members(node, excluded));
	}
	// A union of prop sets: the largest set lists all of the props, and each one is optional,
	// because another set of the union does without it.
	if (Node.isUnionTypeNode(typeNode)) {
		const sets = typeNode.getTypeNodes().map((node) => members(node, excluded));
		const largest = sets.reduce((a, b) => (b.length > a.length ? b : a), []);
		for (const member of largest) optional.add(member);
		return largest;
	}
	if (Node.isTypeReference(typeNode)) {
		const name = typeNode.getTypeName().getText();
		const args = typeNode.getTypeArguments();
		if (name === 'Omit' && args.length === 2) {
			const keys = new Set(excluded);
			const keyNodes = Node.isUnionTypeNode(args[1]) ? args[1].getTypeNodes() : [args[1]];
			for (const key of keyNodes) keys.add(key.getText().replace(/^['"]|['"]$/g, ''));
			return members(args[0], keys);
		}
		// Only a type of this package has props to list. The attributes of an HTML
		// element are the note under the table.
		const local = findType(name);
		if (local && Node.isTypeAliasDeclaration(local)) return members(local.getTypeNode(), excluded);
		if (local) return local.getMembers().filter((m) => !excluded.has(memberName(m)));
	}
	return [];
}

function memberName(member) {
	return Node.isCallSignatureDeclaration(member)
		? ''
		: member.getName().replace(/^['"]|['"]$/g, '');
}

/** The default of each prop, from the destructure of `$props()` in the component. */
function defaults(file) {
	if (!file) return new Map();
	const source = readFileSync(resolve(lib, file), 'utf8');
	const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? '';
	const virtual = project.createSourceFile('virtual.ts', script, { overwrite: true });
	const out = new Map();
	for (const declaration of virtual.getVariableDeclarations()) {
		if (!declaration.getInitializer()?.getText().includes('$props()')) continue;
		const binding = declaration.getNameNode();
		if (!Node.isObjectBindingPattern(binding)) continue;
		for (const element of binding.getElements()) {
			const name = (element.getPropertyNameNode() ?? element.getNameNode())
				.getText()
				.replace(/^['"]|['"]$/g, '');
			let value = element.getInitializer()?.getText();
			if (value === undefined) continue;
			const bindable = value.match(/^\$bindable(?:<[^>]*>)?\((.*)\)$/s);
			if (bindable) {
				if (!bindable[1].trim()) continue;
				value = bindable[1].trim();
			}
			if (value === "''") continue;
			out.set(name, value);
		}
	}
	return out;
}

function prop(member, defaultValues) {
	const docs = member.getJsDocs().at(-1);
	const description = docs?.getDescription().trim() ?? '';
	let type;
	if (Node.isMethodSignature(member)) {
		const params = member
			.getParameters()
			.map((p) => p.getText())
			.join(', ');
		type = `(${params}) => ${member.getReturnTypeNode()?.getText() ?? 'void'}`;
	} else {
		type = member.getTypeNode()?.getText() ?? 'unknown';
	}
	const name = memberName(member);
	return {
		name,
		type: type.replace(/\s+/g, ' '),
		required: !member.hasQuestionToken() && !optional.has(member),
		default: defaultValues.get(name) ?? null,
		description: description.replace(/\r\n/g, '\n')
	};
}

for (const [slug, parts] of Object.entries(PAGES)) {
	const api = {
		component: slug,
		parts: parts.map((part) => {
			const declaration = findType(part.type);
			if (!declaration) throw new Error(`${slug}: no type ${part.type}`);
			const list = Node.isTypeAliasDeclaration(declaration)
				? members(declaration.getTypeNode())
				: declaration.getMembers();
			const defaultValues = defaults(part.file);
			const seen = new Set();
			const props = [];
			for (const member of list) {
				if (!Node.isPropertySignature(member) && !Node.isMethodSignature(member)) continue;
				const entry = prop(member, defaultValues);
				if (seen.has(entry.name)) continue;
				seen.add(entry.name);
				props.push(entry);
			}
			return {
				name: part.name,
				description: part.description,
				// `null` for a mark or a guide, which take only their own props.
				element: part.element ?? null,
				props,
				dataAttributes: part.dataAttributes.map(([name, description]) => ({ name, description }))
			};
		})
	};
	const out = resolve(content, slug, 'api.json');
	writeFileSync(out, JSON.stringify(api, null, '\t') + '\n');
	console.log(
		`${slug}: ${api.parts.length} part(s), ${api.parts.reduce((n, p) => n + p.props.length, 0)} props`
	);
}
