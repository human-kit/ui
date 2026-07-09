<script lang="ts">
	import type { Snippet } from 'svelte';
	import Check from './icons/check.svelte';
	import Copy from './icons/copy.svelte';
	import Code from './icons/code.svelte';

	interface Props {
		source: { code: string; html: string };
		children: Snippet;
	}

	let { source, children }: Props = $props();

	let expanded = $state(false);
	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(source.code);
		copied = true;
		clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="not-prose my-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
	<!-- Preview -->
	<div class="flex min-h-48 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
		{@render children()}
	</div>

	<!-- Toolbar -->
	<div
		class="flex items-center justify-end gap-1 border-t border-gray-200 bg-white px-2 py-1.5 dark:border-gray-800 dark:bg-gray-950"
	>
		<button
			type="button"
			onclick={copy}
			aria-label="Copy source code"
			class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
		>
			{#if copied}
				<Check class="size-3.5" /> Copied
			{:else}
				<Copy class="size-3.5" /> Copy
			{/if}
		</button>
		<button
			type="button"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
			class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
		>
			<Code class="size-3.5" />
			{expanded ? 'Hide code' : 'Show code'}
		</button>
	</div>

	<!-- Source -->
	{#if expanded}
		<div
			class="demo-source max-h-96 overflow-auto border-t border-gray-200 text-[0.8125rem] leading-relaxed dark:border-gray-800"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time shiki output, not user input -->
			{@html source.html}
		</div>
	{/if}
</div>

<style>
	.demo-source :global(pre.shiki) {
		margin: 0;
		padding: 1rem;
		overflow: visible;
	}
</style>
