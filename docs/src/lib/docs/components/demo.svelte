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

<div
	class="not-prose my-4 overflow-hidden rounded-3xl corner-squircle border border-neutral-200 dark:border-neutral-800"
>
	<!-- Preview -->
	<div class="flex min-h-48 items-center justify-center bg-white p-8 dark:bg-neutral-950">
		{@render children()}
	</div>

	<!-- Toolbar -->
	<div
		class="flex items-center justify-end gap-1 border-t border-neutral-200 bg-neutral-50 px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-900"
	>
		<button
			type="button"
			onclick={copy}
			aria-label="Copy source code"
			class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
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
			class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
		>
			<Code class="size-3.5" />
			{expanded ? 'Hide code' : 'Show code'}
		</button>
	</div>

	<!-- Source -->
	{#if expanded}
		<div
			class="demo-source max-h-96 overflow-auto border-t border-neutral-200 text-[0.8125rem] leading-relaxed dark:border-neutral-800"
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
