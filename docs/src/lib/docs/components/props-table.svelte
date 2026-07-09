<script lang="ts">
	import type { ApiProp } from '../api-types.js';

	interface Props {
		part: string;
		props: ApiProp[];
	}

	let { part, props }: Props = $props();
</script>

<div class="not-prose overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="border-b border-gray-200 text-left dark:border-gray-800">
				<th class="px-3 py-2 font-semibold text-gray-900 dark:text-white">Prop</th>
				<th class="px-3 py-2 font-semibold text-gray-900 dark:text-white">Type</th>
				<th class="px-3 py-2 font-semibold text-gray-900 dark:text-white">Default</th>
				<th class="px-3 py-2 font-semibold text-gray-900 dark:text-white">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each props as prop (prop.name)}
				<tr
					id="{part}-{prop.name}"
					class="border-b border-gray-100 last:border-b-0 dark:border-gray-800/60"
				>
					<td class="px-3 py-2 align-top whitespace-nowrap">
						<code
							class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-900 dark:bg-gray-800 dark:text-gray-100"
						>
							{prop.name}{prop.required ? '*' : ''}
						</code>
					</td>
					<td class="max-w-64 px-3 py-2 align-top">
						<code class="text-xs break-words text-blue-700 dark:text-blue-300">{prop.type}</code>
					</td>
					<td class="px-3 py-2 align-top whitespace-nowrap">
						{#if prop.default !== null}
							<code class="text-xs text-gray-600 dark:text-gray-400">{prop.default}</code>
						{:else}
							<span class="text-gray-400 dark:text-gray-600">—</span>
						{/if}
					</td>
					<td class="min-w-48 px-3 py-2 align-top text-gray-600 dark:text-gray-400">
						{prop.description}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
