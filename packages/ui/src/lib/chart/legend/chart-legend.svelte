<script lang="ts">
	import type { ChartSymbol } from '../internal/symbol.js';
	import { useChartContext } from '../root/context.js';
	import type { ChartLegendProps } from '../types.js';

	let { children, class: className = '', ...restProps }: ChartLegendProps = $props();

	const ctx = useChartContext('Chart.Legend');
	// The names in the order of the marks, without duplicates, with the shape of the first mark that
	// gives the series one. One series without a name has nothing to show. A mark of parts of a
	// whole gives its categories, in the order of its parts.
	const items = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch map for one pass.
		const out = new Map<string, { name: ChartSymbol; d: string } | undefined>();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a scratch set for one pass.
		const categories = new Set<string>();
		for (const mark of ctx.marks) {
			mark.read().forEach((s, i) => {
				if (mark.share) for (const p of s.points) categories.add(String(p.x));
				else if (s.name) out.set(s.name, out.get(s.name) ?? mark.symbol?.(i));
			});
		}
		return [...out, ...[...categories].map((name) => [name, undefined, true] as const)];
	});
</script>

<!-- The names of the points also give the series, thus the legend is decoration. -->
{#if items.length}
	<ul class={className} aria-hidden="true" data-legend="" {...restProps}>
		{#each items as [name, shape, category], index (name)}
			<li
				data-series={category ? undefined : name}
				data-category={category ? name : undefined}
				data-symbol={shape?.name}
				data-legend-item=""
			>
				{#if children}
					{@render children({ name, index, symbol: shape?.name })}
				{:else}
					<span data-swatch="">
						{#if shape}<svg width="12" height="12" viewBox="-6 -6 12 12"
								><path d={shape.d} fill="currentColor" /></svg
							>{/if}
					</span>
					{name}
				{/if}
			</li>
		{/each}
	</ul>
{/if}
