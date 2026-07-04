<script lang="ts">
	import type { ApiDataAttribute } from './api-types.js';

	interface Props {
		attributes: ApiDataAttribute[];
	}

	let { attributes }: Props = $props();
</script>

<div class="not-prose overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="border-b border-gray-200 text-left dark:border-gray-800">
				<th class="px-3 py-2 font-semibold text-gray-900 dark:text-white">Attribute</th>
				<th class="px-3 py-2 font-semibold text-gray-900 dark:text-white">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each attributes as attribute (attribute.name)}
				<tr class="border-b border-gray-100 last:border-b-0 dark:border-gray-800/60">
					<td class="px-3 py-2 align-top whitespace-nowrap">
						<code
							class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100"
						>
							{attribute.name}
						</code>
					</td>
					<td class="min-w-48 px-3 py-2 align-top text-gray-600 dark:text-gray-400">
						{attribute.description}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
