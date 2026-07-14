<script lang="ts">
	import { Tabs } from '../tabs';
	import { buttonVariants } from '../button/recipe';
	import { Check, Copy } from '@lucide/svelte';

	// Renders a package-manager tabbed install snippet (pnpm / npm / yarn / bun)
	// with a copy button, built on the vendored Tabs component.
	let { pkg }: { pkg: string } = $props();

	const managers = $derived([
		{ id: 'pnpm', cmd: `pnpm add ${pkg}` },
		{ id: 'npm', cmd: `npm install ${pkg}` },
		{ id: 'yarn', cmd: `yarn add ${pkg}` },
		{ id: 'bun', cmd: `bun add ${pkg}` }
	]);

	let copied = $state<string | null>(null);
	let timeout: ReturnType<typeof setTimeout>;
	async function copy(cmd: string, id: string) {
		await navigator.clipboard.writeText(cmd);
		copied = id;
		clearTimeout(timeout);
		timeout = setTimeout(() => (copied = null), 1500);
	}
</script>

<Tabs.Root defaultValue="pnpm" class="not-prose my-4">
	<Tabs.List class="justify-start!">
		{#each managers as m (m.id)}
			<Tabs.Tab value={m.id}>{m.id}</Tabs.Tab>
		{/each}
	</Tabs.List>
	{#each managers as m (m.id)}
		<Tabs.Panel value={m.id} class="flex items-center justify-between gap-3 py-2!">
			<code class="overflow-x-auto font-mono text-[0.8125rem] text-foreground">{m.cmd}</code>
			<button
				type="button"
				class="{buttonVariants({ variant: 'ghost', size: 'icon-sm' })} shrink-0"
				aria-label="Copy {m.id} command"
				onclick={() => copy(m.cmd, m.id)}
			>
				{#if copied === m.id}
					<Check class="size-3.5" />
				{:else}
					<Copy class="size-3.5" />
				{/if}
			</button>
		</Tabs.Panel>
	{/each}
</Tabs.Root>
