<script lang="ts">
	import { untrack } from 'svelte';
	import PropsTable from '../props-table/props-table.svelte';
	import DataAttributesTable from '../data-attributes-table/data-attributes-table.svelte';
	import { registerHeadings } from '../toc/toc-registry.svelte.js';
	import type { ComponentApi } from '../../api-types.js';

	interface Props {
		api: ComponentApi;
	}

	let { api }: Props = $props();

	// Surface the `api-*` part headings to the TOC so they render in SSR (the
	// preprocessor cannot see them — this component produces them at runtime).
	// Registered during init so the SSR TOC (rendered after the content) sees
	// them; unregistered on unmount so client-side navigation doesn't leave the
	// previous page's entries in the TOC.
	const unregister = untrack(() =>
		registerHeadings(
			api.parts.map((part) => ({ id: `api-${part.name.toLowerCase()}`, text: part.name, depth: 3 }))
		)
	);
	$effect(() => unregister);
</script>

{#each api.parts as part (part.name)}
	<h3 id="api-{part.name.toLowerCase()}">{part.name}</h3>
	{#if part.description}
		<p>{part.description}</p>
	{/if}

	{#if part.props.length > 0}
		<div class="mt-4">
			<PropsTable part={part.name.toLowerCase()} props={part.props} />
		</div>
		<p class="mt-2 text-xs text-muted-foreground">
			* required. Native HTML attributes of the underlying element are also accepted.
		</p>
	{/if}

	{#if part.dataAttributes.length > 0}
		<!-- Data attributes are part of the same API reference (no separate
		     heading); they render as the same expandable table as the props. -->
		<div class="mt-4">
			<DataAttributesTable attributes={part.dataAttributes} />
		</div>
	{/if}
{/each}
