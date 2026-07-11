<script lang="ts">
	import type { ApiDataAttribute } from '../api-types.js';

	interface Props {
		attributes: ApiDataAttribute[];
	}

	let { attributes }: Props = $props();
</script>

<div class="not-prose overflow-x-auto rounded-lg border border-border">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="border-b border-border text-left">
				<th class="px-3 py-2 font-semibold text-foreground">Attribute</th>
				<th class="px-3 py-2 font-semibold text-foreground">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each attributes as attribute (attribute.name)}
				<tr class="border-b border-border-subtle last:border-b-0">
					<td class="px-3 py-2 align-top whitespace-nowrap">
						<code
							class="rounded bg-accent px-1.5 py-0.5 text-xs text-foreground"
						>
							{attribute.name}
						</code>
					</td>
					<td class="min-w-48 px-3 py-2 align-top text-muted-foreground">
						{attribute.description}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
