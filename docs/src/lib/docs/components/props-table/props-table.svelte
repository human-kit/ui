<script lang="ts">
	import { Collapsible } from '../collapsible';
	import { ChevronDown } from '@lucide/svelte';
	import type { ApiProp } from '../../api-types.js';

	interface Props {
		part: string;
		props: ApiProp[];
	}

	let { part, props }: Props = $props();

	// Prop / Type / Default share one grid template across the header and every
	// row so the columns line up; the trailing `1rem` track holds the chevron.
	const columns = 'grid grid-cols-[minmax(6rem,1fr)_minmax(8rem,1.4fr)_minmax(4rem,0.7fr)_1rem]';

	// Type syntax coloring: TS primitives get one hue, every other identifier
	// (component types, DOM types, `function`, …) another, and punctuation stays
	// muted — so a union like `boolean | null` reads at a glance.
	const PRIMITIVES = new Set([
		'string',
		'number',
		'boolean',
		'bigint',
		'symbol',
		'null',
		'undefined',
		'void',
		'any',
		'unknown',
		'never',
		'object',
		'true',
		'false',
		'this'
	]);

	type TypeToken = { text: string; kind: 'primitive' | 'identifier' | 'punctuation' | 'space' };

	function tokenizeType(type: string): TypeToken[] {
		const tokens: TypeToken[] = [];
		// Identifiers (may include dots, e.g. `React.CSSProperties`), whitespace, or
		// a run of punctuation (`|`, `<`, `[]`, …).
		const pattern = /([A-Za-z_$][\w$.]*)|(\s+)|([^\sA-Za-z_$]+)/g;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(type)) !== null) {
			if (match[1] !== undefined) {
				tokens.push({
					text: match[1],
					kind: PRIMITIVES.has(match[1]) ? 'primitive' : 'identifier'
				});
			} else if (match[2] !== undefined) {
				tokens.push({ text: match[2], kind: 'space' });
			} else {
				tokens.push({ text: match[3], kind: 'punctuation' });
			}
		}
		return tokens;
	}
</script>

{#snippet coloredType(value: string)}
	<span class="font-mono text-xs">
		{#each tokenizeType(value) as token, i (i)}
			{#if token.kind === 'primitive'}
				<span class="text-blue-600 dark:text-blue-400">{token.text}</span>
			{:else if token.kind === 'identifier'}
				<span class="text-orange-600 dark:text-orange-400">{token.text}</span>
			{:else if token.kind === 'punctuation'}
				<span class="text-muted-foreground">{token.text}</span>
			{:else}
				{token.text}
			{/if}
		{/each}
	</span>
{/snippet}

<div class="not-prose overflow-hidden rounded-xl border">
	<div
		class="{columns} items-center gap-3 border-b bg-(--sink-bg) px-3 py-1.5 text-sm font-medium text-foreground"
	>
		<span>Prop</span>
		<span>Type</span>
		<span>Default</span>
		<span></span>
	</div>

	{#each props as prop (prop.name)}
		<!-- Each prop is a collapsible row: Prop / Type / Default stay visible, and
		     the full detail (name, description, boxed type, default) is revealed on
		     expand with the same height+opacity animation as the nav collapsibles. -->
		<Collapsible.Root id="{part}-{prop.name}" class="border-b last:border-b-0">
			<Collapsible.Trigger
				class="{columns} group w-full items-center gap-3 px-3 py-1 text-left outline-none transition-colors hover:bg-(--press-bg) data-focus-visible:bg-(--press-bg)"
			>
				<span class="w-fit rounded bg-accent px-1.5 py-0.5 font-mono text-xs text-foreground">
					{prop.name}{prop.required ? '*' : ''}
				</span>
				<!-- Truncate long types/defaults to one line so every row keeps the
				     same height; the full value is shown in the expanded panel. -->
				<div class="min-w-0 truncate">{@render coloredType(prop.type)}</div>
				{#if prop.default !== null}
					<div class="min-w-0 truncate">{@render coloredType(prop.default)}</div>
				{:else}
					<span class="text-muted-foreground">—</span>
				{/if}
				<ChevronDown
					class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open:rotate-180"
				/>
			</Collapsible.Trigger>

			<Collapsible.Panel class="border-t">
				<!-- Reuse the row grid so labels sit in the first column (under Prop)
				     and values start in the second (under Type); `dd` margins reset
				     (the UA default indents them). Description sits last. -->
				<dl class="{columns} gap-x-3 gap-y-2.5 p-3 py-2 text-sm [&_dd]:m-0">
					<dt class="text-muted-foreground">Name</dt>
					<dd class="col-span-3">
						<span class="font-mono text-xs text-foreground">{prop.name}</span>
						{#if prop.required}
							<span class="ml-1 text-xs text-muted-foreground">(required)</span>
						{/if}
					</dd>

					<dt class="text-muted-foreground">Type</dt>
					<dd class="col-span-3 min-w-0 wrap-break-word">{@render coloredType(prop.type)}</dd>

					<dt class="text-muted-foreground">Default</dt>
					<dd class="col-span-3 min-w-0 wrap-break-word">
						{#if prop.default !== null}
							{@render coloredType(prop.default)}
						{:else}
							<span class="text-muted-foreground">—</span>
						{/if}
					</dd>

					<dt class="text-muted-foreground">Description</dt>
					<dd class="col-span-3 text-subtle-foreground">{prop.description}</dd>
				</dl>
			</Collapsible.Panel>
		</Collapsible.Root>
	{/each}
</div>
