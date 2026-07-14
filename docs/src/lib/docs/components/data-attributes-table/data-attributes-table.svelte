<script lang="ts">
	import type { ApiDataAttribute } from '../../api-types.js';

	interface Props {
		attributes: ApiDataAttribute[];
	}

	let { attributes }: Props = $props();

	// Attribute / Description share one grid template across the header and every
	// row so the two columns line up. `fr` tracks (not `auto`) keep the columns
	// aligned across the separate per-row grids.
	const columns = 'grid grid-cols-[minmax(9rem,1fr)_2.4fr]';
</script>

<div class="not-prose overflow-hidden rounded-lg border border-border">
	<div
		class="{columns} items-center gap-3 border-b border-border bg-(--sink-bg) px-3 py-1.5 text-sm font-medium text-foreground"
	>
		<span>Data attribute</span>
		<span>Description</span>
	</div>

	{#each attributes as attribute (attribute.name)}
		<!-- Data attributes are simple (name + description), so the description sits
		     in its own column rather than behind a collapsible. -->
		<div class="{columns} items-start gap-3 border-b border-border-subtle px-3 py-2 last:border-b-0">
			<span class="w-fit rounded bg-accent px-1.5 py-0.5 font-mono text-xs text-foreground">
				{attribute.name}
			</span>
			<span class="text-sm text-subtle-foreground">{attribute.description}</span>
		</div>
	{/each}
</div>
