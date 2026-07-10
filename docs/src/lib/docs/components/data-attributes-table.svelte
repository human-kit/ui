<script lang="ts">
	import type { ApiDataAttribute } from '../api-types.js';

	interface Props {
		attributes: ApiDataAttribute[];
	}

	let { attributes }: Props = $props();
</script>

<div class="not-prose overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="border-b border-neutral-200 text-left dark:border-neutral-800">
				<th class="px-3 py-2 font-semibold text-neutral-900 dark:text-white">Attribute</th>
				<th class="px-3 py-2 font-semibold text-neutral-900 dark:text-white">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each attributes as attribute (attribute.name)}
				<tr class="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800/60">
					<td class="px-3 py-2 align-top whitespace-nowrap">
						<code
							class="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
						>
							{attribute.name}
						</code>
					</td>
					<td class="min-w-48 px-3 py-2 align-top text-neutral-600 dark:text-neutral-400">
						{attribute.description}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
