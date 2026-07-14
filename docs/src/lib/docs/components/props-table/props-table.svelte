<script lang="ts">
	import type { ApiProp } from '../api-types.js';

	interface Props {
		part: string;
		props: ApiProp[];
	}

	let { part, props }: Props = $props();
</script>

<div class="not-prose overflow-x-auto rounded-lg border border-border">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="border-b border-border text-left">
				<th class="px-3 py-2 font-semibold text-foreground">Prop</th>
				<th class="px-3 py-2 font-semibold text-foreground">Type</th>
				<th class="px-3 py-2 font-semibold text-foreground">Default</th>
				<th class="px-3 py-2 font-semibold text-foreground">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each props as prop (prop.name)}
				<tr
					id="{part}-{prop.name}"
					class="border-b border-border-subtle last:border-b-0"
				>
					<td class="px-3 py-2 align-top whitespace-nowrap">
						<code
							class="rounded bg-accent px-1.5 py-0.5 text-xs text-foreground"
						>
							{prop.name}{prop.required ? '*' : ''}
						</code>
					</td>
					<td class="max-w-64 px-3 py-2 align-top">
						<code class="text-xs break-words text-blue-700 dark:text-blue-300">{prop.type}</code>
					</td>
					<td class="px-3 py-2 align-top whitespace-nowrap">
						{#if prop.default !== null}
							<code class="text-xs text-muted-foreground">{prop.default}</code>
						{:else}
							<span class="text-muted-foreground">—</span>
						{/if}
					</td>
					<td class="min-w-48 px-3 py-2 align-top text-muted-foreground">
						{prop.description}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
