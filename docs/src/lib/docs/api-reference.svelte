<script lang="ts">
	import PropsTable from './props-table.svelte';
	import DataAttributesTable from './data-attributes-table.svelte';
	import type { ComponentApi } from './api-types.js';

	interface Props {
		api: ComponentApi;
	}

	let { api }: Props = $props();
</script>

{#each api.parts as part (part.name)}
	<h3 id="api-{part.name.toLowerCase()}">{part.name}</h3>
	{#if part.description}
		<p>{part.description}</p>
	{/if}

	{#if part.props.length > 0}
		<PropsTable part={part.name.toLowerCase()} props={part.props} />
		<p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
			* required. Native HTML attributes of the underlying element are also accepted.
		</p>
	{/if}

	{#if part.dataAttributes.length > 0}
		<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-900 dark:text-white">Data attributes</h4>
		<DataAttributesTable attributes={part.dataAttributes} />
	{/if}
{/each}
