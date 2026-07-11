<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Collapsible } from '@human-kit/svelte-components';
	import Button from './button/button.svelte';
	import { buttonVariants } from './button/recipe';
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

<div class="not-prose my-4 overflow-hidden rounded-2xl corner-squircle border border-border">
	<!-- Preview -->
	<div class="flex min-h-48 items-center justify-center bg-surface p-8">
		{@render children()}
	</div>

	<Collapsible.Root open={expanded} onOpenChange={(next) => (expanded = next)}>
		<!-- Toolbar -->
		<div class="flex items-center justify-end gap-1 border-t bg-muted p-1">
			<Button variant="ghost" size="sm" onclick={copy} aria-label="Copy source code">
				{#if copied}
					<Check /> Copied
				{:else}
					<Copy /> Copy
				{/if}
			</Button>
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
				<Code />
				{expanded ? 'Hide code' : 'Show code'}
			</Collapsible.Trigger>
		</div>

		<!-- Source -->
		<Collapsible.Panel
			class="demo-source max-h-96 overflow-auto border-t border-border text-[0.8125rem] leading-relaxed"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- build-time shiki output, not user input -->
			{@html source.html}
		</Collapsible.Panel>
	</Collapsible.Root>
</div>

<style>
	:global(.demo-source pre.shiki) {
		margin: 0;
		padding: 1rem;
		overflow: visible;
	}
</style>
