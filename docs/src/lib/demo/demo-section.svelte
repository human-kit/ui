<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children: Snippet;
		controls?: Snippet;
	}

	let { title, description, children, controls }: Props = $props();
</script>

<section class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
	<!-- Header -->
	<div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
		{#if description}
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
		{/if}
	</div>

	<div class="flex flex-col lg:flex-row">
		<!-- Preview Area -->
		<div class="flex min-h-50 flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-800">
			{@render children()}
		</div>

		<!-- Controls Panel -->
		{#if controls}
			<div
				class="w-full border-t border-gray-200 bg-white p-4 lg:w-72 lg:border-t-0 lg:border-l dark:border-gray-700 dark:bg-gray-900"
			>
				<h4 class="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Controls</h4>
				{@render controls()}
			</div>
		{/if}
	</div>
</section>
